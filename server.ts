const express = require('express');
import { join } from 'path';

import compression from 'compression';
import cookieparser from 'cookie-parser';
import { enableProdMode } from '@angular/core';
import CardWorker from './server/cardsWorker';
import ApiWorker from './server/apiWorker';
import BucketWorker from './server/bucketWorker';

const os = require('os');
const cors = require('cors');
const QRCode = require('qrcode');
const puppeteer = require('puppeteer');
const httpRequest = require('request');

var imageFolder = join(__dirname, 'server/public');
var stream = require('stream');

const whitelist = [
  'http://localhost:3000',
  'http://localhost:4000',
  'http://localhost:4200',
  'https://pitch59.com',
  'https://dev.pitch59.com',
];

const corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};

// for debug
require('source-map-support').install();

// for tests
const test = process.env['TEST'] === 'true';

const DIST_FOLDER = __dirname;

var dir = join(__dirname, 'public');

// ssr DOM
const domino = require('domino');
const fs = require('fs');
const path = require('path');
// index from browser build!
const template = fs.readFileSync(path.join(DIST_FOLDER, 'browser', 'index.html')).toString();
// for mock global window by domino
const win = domino.createWindow(template);
// mock
global['window'] = win;
global['document'] = win.document;
global['branch'] = null;
global['object'] = win.object;
global['HTMLElement'] = win.HTMLElement;
global['HTMLCanvasElement'] = win.HTMLCanvasElement;
global['navigator'] = win.navigator;
// not implemented property and functions
Object.defineProperty(win.document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    };
  },
});
// othres mock
global['CSS'] = null;
// global['XMLHttpRequest'] = require('xmlhttprequest').XMLHttpRequest;
global['Prism'] = null;

enableProdMode();

// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  const server = express();
  const distFolder = join(__dirname, 'browser');
  const indexHtml = fs.existsSync(join(distFolder, 'index.original.html'))
    ? 'index.original.html'
    : 'index';

  // redirects!

  let queryParamsString = '';
  const redirectowww = false;
  const redirectohttps = false;
  const wwwredirecto = true;
  server.use((req, res, next) => {
    // for domain/index.html
    if (req.url === '/index.html') {
      res.redirect(301, 'https://' + req.hostname);
    }

    // check if it is a secure (https) request
    // if not redirect to the equivalent https url
    if (
      redirectohttps &&
      req.headers['x-forwarded-proto'] !== 'https' &&
      req.hostname !== 'localhost'
    ) {
      // special for robots.txt
      if (req.url === '/robots.txt') {
        next();
        return;
      }
      return res.redirect(301, 'https://' + req.hostname + req.url);
    }

    // www or not
    if (redirectowww && !req.hostname.startsWith('www.')) {
      return res.redirect(301, 'https://www.' + req.hostname + req.url);
    }

    // www or not
    if (wwwredirecto && req.hostname.startsWith('www.')) {
      const host = req.hostname.slice(4, req.hostname.length);
      return res.redirect(301, 'https://' + host + req.url);
    }

    res.set({
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Xss-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
    });

    next();
  });

  server.set('view engine', 'html');
  server.set('views', distFolder);

    // Example Express Rest API endpoints
    // app.get('/api/**', (req, res) => { });
    // Serve static files from /browser
    server.get(
      '*.*',
      express.static(distFolder, {
        maxAge: '6h',
      })
    );

  // server.get('/card/:alias/dl', cors(corsOptionsDelegate), dlCardHandler);
  // server.get('/card/:alias', cardHandler);
  server.get('/card/:alias', setMetaTags);

  server.get('/apple-app-site-association', (req, res) => {
    const filePath = __dirname + '/browser/apple-app-site-association.json';
    res.sendFile(path.resolve(filePath));
  });

  server.get('/.well-known/assetlinks.json', (req, res) => {
    const filePath = __dirname + '/browser/assetlinks.json';
    res.sendFile(path.resolve(filePath));
  });

  // All regular routes use the CSR engine
  server.get('*', (req, res) => {
    const filePath = __dirname + '/browser/index.html';
    res.sendFile(path.resolve(filePath));
  });

  return server;

  function dlCardHandler(req, res) {
    ApiWorker.GetBusinessPitchModelByAlias(req.params.alias).then(async (card) => {
      if (!card) {
        throw new Error('No such card were found!');
      }
      const filledCard = CardWorker.getCard(
        card.data.data,
        `${req.protocol}://${req.headers.host}`
      );
      let siteData = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700,900&display=swap" rel="stylesheet">
          <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
          />
          <link href="/assets/card/media.css" rel="stylesheet" />
          <link href="/assets/card/style.css" rel="stylesheet" />
          <script src="/assets/card/card.js"></script>
        </head>
        <body style="padding: 24px;
          --scale-factor: 1;
          --scale-factor-main: 1;
          --name-size: 1;
          --title-size: 1;">
          *|PITCH_CARD|*
        </body>
      `;
      siteData = siteData.replace('*|PITCH_CARD|*', filledCard);
      dlImageMaker(
        res,
        siteData.replace('video-thumbnail hidden', 'video-thumbnail'),
        req.params.alias
      );
    });
  }

  function cardHandler(req, res) {
    ApiWorker.GetBusinessPitchModelByAlias(req.params.alias)
      .then(async (card) => {
        const defaultResumePitchCard = {
          videoThumbnailId: null,
          videoFileId: 'o00Ik3NM802tZwva2YXb01IC5WymxR2cboe',
          videoFileUrl: 'https://stream.mux.com/Ai00JRGV75BVcaSfIOkE02ysIlETBgH2T2.m3u8',
          videoThumbnailUrl:
            'https://image.mux.com/Ai00JRGV75BVcaSfIOkE02ysIlETBgH2T2/thumbnail.jpg',
          videoCoverImageThumbnailId: '0ccbe2bc537946638d6d9ccf50968b5f.jpg',
          videoCoverImageFileId: '0ccbe2bc537946638d6d9ccf50968b5f.jpg',
          businessLogoThumbnailId: null,
          businessLogoFilelId: null,
          businessId: '314720083589753629',
          businessName: 'Scott C',
          businessType: 'resume',
          title: ' ',
          resumeFileId: '97c8ba1f71f742828aa7b9fb4dcfe230.jpg',
          resumeFileUrl:
            'https://pitch59-prod.s3.amazonaws.com/97c8ba1f71f742828aa7b9fb4dcfe230.jpg',
          facebookLink: null,
          linkedinLink: null,
          instagramLink: null,
          twitterLink: null,
          pinterestLink: null,
          educationLevel: 2,
          workingHours: [],
          textingNumber: null,
          noTexting: false,
          hasMilitaryService: true,
          businessStatus: 2,
          pricingModel: 'werty',
          employeePictureFileIds: '1f79fcd78c6e489384dac6c88b727214.jpg',
          employeePictureThumnailIds: '1f79fcd78c6e489384dac6c88b727214.jpg',
          employeePictureThumnailUrl: [
            'https://pitch59-prod.s3.amazonaws.com/1f79fcd78c6e489384dac6c88b727214.jpg',
          ],
          googlePageId: null,
          facebookPageId: null,
          email: 'examplecard@gmail.com',
          contactNumber: '(889) 999-9125',
          websiteLink: 'qa@gmail.com',
          address: 'Madison Squere Garden',
          state: '95013700558461305',
          city: '95013717151288878',
          cityTbl: null,
          zip: '10001',
          placeId: 'ChIJ_xkgOm1TBogRmEFIurX8DE4',
          latitude: 43.0730517,
          longitude: -89.4012302,
          radius: 25,
          stripeCustomerId: null,
          accountStatus: true,
          userId: '288194877010259100',
          user: null,
          businessLogoThumbnailUrl: null,
          videoCoverImageThumbnailUrl:
            'https://pitch59-prod.s3.amazonaws.com/0ccbe2bc537946638d6d9ccf50968b5f.jpg',
          isFavoriteBusiness: false,
          isChoosenBusiness: false,
          averageCustomerRating: 0,
          averageQualityRating: 0,
          videoReviewCount: 0,
          rejectReason: null,
          isViewdAdmin: true,
          isOffline: false,
          isHideTitle: false,
          chosenPrice: 0,
          watchedPrice: 0,
          numberOfNewReviews: 0,
          numberOfNewCustomers: 0,
          categoryNames: null,
          alias: 'resume-card',
          calendarLink: null,
          businessTags: null,
          educationalInstitutions: [],
          positions: [],
          skills: [],
          businessMonthlyBudget: [],
          createdAt: '1612177515148',
          createdBy: '288194877010259100',
          updatedAt: '1612347351230',
          updatedBy: '182778152707223213',
          id: '314720083589753629',
        };
        if (!card) {
          throw new Error('No such card were found!');
        }
        const filledCard = CardWorker.getCard(
          card.data.data,
          `${req.protocol}://${req.headers.host}`
        );
        const mockResumeCard = CardWorker.getCard(
          defaultResumePitchCard,
          `${req.protocol}://${req.headers.host}`
        );
        let siteData = fs.readFileSync(
          path.join(__dirname, '/browser/assets/card/card.html'),
          'utf8'
        );
        siteData = siteData.replace('*|PITCH_CARD|*', filledCard);
        siteData = siteData.replace('*|MOCK_RESUME_PITCH_CARD|*', mockResumeCard);
        siteData = siteData.replace('*|BUSINESS-ID|*', card.data.data.id ? card.data.data.id : '');
        siteData = siteData.replace(
          '*|BUSINESS-TYPE|*',
          card.data.data.businessType ? card.data.data.businessType : ''
        );
        siteData = siteData.replace('*|ID|*', card.data.data.id ? card.data.data.id : '');

        const metaTags = CardWorker.setMetaTags(
          card.data.data,
          `https://pitch59-prod.s3.amazonaws.com/IP_${card.data.data.id}.jpg`,
          `${req.protocol}://${req.headers.host}`,
          await ApiWorker.GetBusinessReviewsData(card.data.data.id)
        );
        siteData = siteData.replace('*|META_TAGS|*', metaTags);
        siteData = siteData.replace(
          '*|TITLE|*',
          CardWorker.getSugesstionsDisplayName(card.data.data)
        );
        siteData = siteData.replace(
          '*|EMAIL|*',
          card.data.data.email
            ? `
        <li>
          <div>
            <img rel="preload" class="contact-menu-icon" src="/assets/card/img/email-outline.svg" alt="Email">
          </div>
          <a id="emailHref" href="mailto:${card.data.data.email}">
            <span class="cm-title">Email</span>
            <br>
            <span id="emailValue" class="cm-value">${card.data.data.email}</span>
          </a>
        </li>
        `
            : ''
        );
        siteData = siteData.replace(
          '*|PHONE|*',
          card.data.data.contactNumber
            ? `
        <li>
          <div>
            <img rel="preload" class="contact-menu-icon" src="/assets/card/img/call-outline.svg" alt="Call">
          </div>
          <a id="phoneHref" href="tel:${card.data.data.contactNumber}">
            <span class="cm-title">Call</span>
            <br>
            <span id="phoneValue" class="cm-value">${card.data.data.contactNumber}</span>
          </a>
        </li>
        `
            : ''
        );

        siteData = siteData.replace(
          '*|PHONE-CALL-MOBILE|*',
          card.data.data.contactNumber
            ? `
        <li>
          <div class="contact-icon">
            <img rel="preload" src="/assets/card/img/phoneicon.svg" alt="Phone">
          </div>

          <a id="phoneHref" href="tel:${card.data.data.contactNumber}">
            <span id="phoneValue" class="contact-title">${card.data.data.contactNumber}</span>
          </a>
        </li>
        `
            : ''
        );
        siteData = siteData.replace(
          '*|EMAIL-MOBILE|*',
          card.data.data.email
            ? `
        <li>
          <div class="contact-icon">
            <img rel="preload" src="/assets/card/img/emailicon.svg" alt="Email">
          </div>
          <a id="emailHref" href="mailto:${card.data.data.email}">
            <span id="emailValue" class="contact-title">${card.data.data.email}</span>
          </a>
        </li>
        `
            : ''
        );
        siteData = siteData.replace(
          '*|DIRECTIONS-LI-MOBILE|*',
          card.data.data.address
            ? `
        <li>
          <div class="contact-icon">
            <img rel="preload" src="/assets/card/img/directions.svg" alt="Location">
          </div>

          <a id="emailHref" href="https://www.google.com/maps/search/?api=1&query=${
            card.data.data.address
          }" target="_blank">
            <span id="directionsValue" class="contact-title">${addressFormatter(
              card.data.data
            )}</span>
          </a>
        </li>
        `
            : ''
        );
        siteData = siteData.replace(
          '*|CALENDAR-LI-MOBILE|*',
          card.data.data.calendarLink
            ? `
        <li
          data-target="calendar-link"
          data-id="${card.data.data.calendarLink}">
            <div class="contact-icon">
              <img rel="preload" src="/assets/card/img/scheduleicon.svg" alt="Schedule"/>
            </div>

            <div>
              <span class="contact-title">Schedule</span>
            </div>
        </li>
        `
            : ''
        );

        siteData = siteData.replace(
          '*|SMS-PHONE|*',
          card.data.data.contactNumber ? `sms://${card.data.data.contactNumber}` : '#'
        );
        siteData = siteData.replace(/\*\|GMAPS-LINK\|\*/g, addressFormatter(card.data.data)); // Will it be used on resume pitchcard?
        siteData = siteData.replace(
          '*|MORE-INFO-TITLE|*',
          card.data.data.businessType === 'job' ? '' : 'More Information'
        );
        siteData = siteData.replace('*|MORE-INFO|*', CardWorker.setMoreInfoContent(card.data.data));
        siteData = siteData.replace(
          /\*\|SHARED-LINK\|\*/g,
          `${req.protocol}://${req.headers.host}/card/${card.data.data.alias.replace(
            /\s/g,
            '%20'
          )}${queryParamsString ? queryParamsString : ''}`
        );
        siteData = siteData.replace(/\*\|VIDEO-URL\|\*/g, card.data.data.videoFileUrl);
        siteData = siteData.replace(
          '*|VIDEO-ROTATED|*',
          card.data.data.isMirrorVideo ? 'video-rotated' : ''
        );
        siteData = siteData.replace(
          '*|DIRECTIONS-LI|*',
          card.data.data.address
            ? `
        <li>
          <div>
            <img rel="preload" class="contact-menu-icon" src="/assets/images/pitch-card-svg/directionpin-outline.svg" alt="Directions">
          </div>
          <a id="emailHref" href="https://www.google.com/maps/search/?api=1&query=${
            card.data.data.address
          }" target="_blank">
            <span class="cm-title">Directions</span>
            <br>
            <span id="directionsValue" class="cm-value">${addressFormatter(card.data.data)}</span>
          </a>
        </li>
        `
            : ''
        );
        siteData = siteData.replace(
          '*|CALENDAR-LINK|*',
          card.data.data.calendarLink
            ? `
        <li
          data-target="calendar-link"
          data-id="${card.data.data.calendarLink}">
            <div>
              <img
                rel="preload"
                class="contact-menu-icon"
                src="/assets/images/pitch-card-svg/schedule-outline.svg"
                alt="Schedule"/>
            </div>
            <div class="cm-content">
              <span class="cm-title">Schedule</span>
              <br />
              <span class="cm-value">Set up an appointment</span>
            </div>
        </li>
        `
            : ''
        );
        siteData = siteData.replace(
          '*|PICTURE-URLS|*',
          JSON.stringify(card.data.data.employeePictureFileUrl)
        );
        siteData = siteData.replace(
          '*|THUMBNAIL-URLS|*',
          JSON.stringify(card.data.data.employeePictureThumnailUrl)
        );
        queryParamsString = Object.keys(req.query).reduce((acc, elem) => {
          return acc + elem + '=' + req.query[elem];
        }, '?');
        siteData = siteData.replace(
          '*|PREVIEW-BOTTOM|*',
          req.query.i && req.query.i === 'a'
            ? `
          <div class="what-is-pitch" data-toggle="modal" data-target="modal-what-is-pitch-video" data-type="what-is-pitch-video" data-id="id">
            <img src="${req.protocol}://${req.headers.host}/assets/images/play-icon.svg" alt="Pitch59 Company Logo" />
            <span>What is Pitch59?</span>
          </div>
          <div class="create-a-pitchcard">
            <a href="${req.protocol}://${req.headers.host}/pricing">CREATE A PITCHCARD</a>
          </div>
        `
            : `
          <div class="welcome-demo">
            <span class="sprite chat">Powered by</span>
            <a href="${req.protocol}://${req.headers.host}">
              <img
                rel="preload"
                src="${req.protocol}://${req.headers.host}/assets/images/logo/pitch59-logo-white.svg"
                alt="Brand"
              />
            </a>
          </div>
        `
        );
        siteData = siteData.replace(
          '*|IS-JOB-INFO|*',
          card.data.data.businessType === 'job' ? 'job-info-modal' : ''
        );
        siteData = siteData.replace(
          /\*\|URI-LINK\|\*/g,
          encodeURIComponent(
            `${req.protocol}://${req.headers.host}/card/${card.data.data.alias}${
              queryParamsString ? queryParamsString : ''
            }`
          )
        );
        siteData = siteData.replace(/\*\|BASE-URL\|\*/g, `${req.protocol}://${req.headers.host}`);
        siteData = siteData.replace(
          /\*\|QR-URL\|\*/g,
          await generateQR(
            `${req.protocol}://${req.headers.host}/card/${card.data.data.alias}${
              queryParamsString ? queryParamsString : ''
            }`
          )
        );
        if (card.data.data.businessType === 'resume') {
          siteData = siteData.replace(
            '*|RESUME-VIEW-CLASS|*',
            showDocViewer(card.data.data.resumeFileUrl) ? 'doc-view' : 'img-view'
          );
          siteData = siteData.replace(
            '*|RESUME|*',
            card.data.data.resumeFileUrl && showDocViewer(card.data.data.resumeFileUrl)
              ? `<iframe
                  id="iframe"
                  src="${setResumeUrl(card.data.data.resumeFileUrl)}"
                  frameborder="0"
                ></iframe>`
              : ''
          );
          siteData = siteData.replace(
            '*|RESUME-IMAGE|*',
            card.data.data.resumeFileUrl && !showDocViewer(card.data.data.resumeFileUrl)
              ? `<div class="image-resume-preview">
                    <img src="${card.data.data.resumeFileUrl}" alt="resume image"/>
                 </div>`
              : ''
          );
          siteData = siteData.replace('*|LOGO-URL|*', '');
          siteData = siteData.replace('*|VIDEO-REVIEWS-TITLE|*', 'Video References');
          siteData = siteData.replace('*|REVIEW-BUTTON-LABEL|*', 'Leave a Reference');
          siteData = siteData.replace('*|REVIEW-LOGO-VIEW|*', 'style="display: none"');
          siteData = siteData.replace(
            '*|RESUME-DOWNLOAD|*',
            card.data.data.resumeFileUrl && showDocViewer(card.data.data.resumeFileUrl)
              ? `<div class="download-block"><a class="link green pointer p-grid no-margins"
                    href="${card.data.data.resumeFileUrl}" target="_blank" download="resume">
                        <img src="/assets/images/pitch-card-svg/download-icon.svg" alt="Download" style="width: 17px; margin-right: 5px;">
                        <span>Download Resume</span>
                </a></div>`
              : ''
          );
          siteData = siteData.replace(
            '*|RESUME-UNAVAILABLE|*',
            !card.data.data.resumeFileUrl
              ? '<div class="unavailable-block no-margins">' +
              '    <h2 style="font-weight: 500; font-size: 22px; color: #444;">Resume Unavailable</h2>' +
              '  </div>'
              : ''
          );
        } else {
          siteData = siteData.replace('*|RESUME|*', '');
          siteData = siteData.replace('*|RESUME-DOWNLOAD|*', '');
          siteData = siteData.replace('*|RESUME-UNAVAILABLE|*', '');
          siteData = siteData.replace('*|RESUME-IMAGE|*', '');
          siteData = siteData.replace('*|LOGO-URL|*', card.data.data.businessLogoThumbnailUrl);
          siteData = siteData.replace(
            '*|VIDEO-REVIEWS-TITLE|*',
            card.data.data.businessType === 'job'
              ? 'Employee Reviews'
              : card.data.data.businessType === 'service'
              ? 'Video Testimonials '
              : 'Video Reviews'
          );
          siteData = siteData.replace(
            '*|REVIEW-BUTTON-LABEL|*',
            card.data.data.businessType === 'service' ? 'Leave a Testimonial ' : 'Leave a Review'
          );
          siteData = siteData.replace('*|REVIEW-LOGO-VIEW|*', 'style="display: initial"');
        }

        if (!req.query.i || (req.query.i && req.query.i !== 'a')) {
          screenshotMaker(
            card.data.data.id,
            siteData.replace('video-thumbnail hidden', 'video-thumbnail')
          );
        }
        res.setHeader('Content-Type', 'text/html');
        res.send(siteData);
        res.end();
      })
      .catch(async (err) => {
        const comingSoonCard = {
          businessType: 'basic',
          title: '',
          id: 0,
          isHideTitle: true,
          videoCoverImageThumbnailUrl: '',
          videoFileUrl: '',
          employeePictureThumnailUrl: '',
          facebookLink: '',
          twitterLink: '',
          instagramLink: '',
          linkedinLink: '',
          pinterestLink: '',
          resumeFileUrl: '',
          businessLogoThumbnailUrl: '',
          workingHours: '',
          pricingModel: '',
        };
        const filledCard = CardWorker.getCard(
          comingSoonCard,
          `${req.protocol}://${req.headers.host}`
        );
        let siteData = fs.readFileSync(
          path.join(__dirname, '/browser/assets/card/card.html'),
          'utf8'
        );
        siteData = siteData.replace('*|PITCH_CARD|*', filledCard);

        const metaTags = CardWorker.setMetaTags(
          comingSoonCard,
          `https://pitch59-prod.s3.amazonaws.com/IP_0.jpg`,
          `${req.protocol}://${req.headers.host}`,
          null
        );
        siteData = siteData.replace('*|META_TAGS|*', metaTags);
        siteData = siteData.replace('*|TITLE|*', 'Pitch59');
        siteData = siteData.replace('*|EMAIL|*', '');
        siteData = siteData.replace('*|PHONE|*', '');
        siteData = siteData.replace('*|MORE-INFO-TITLE|*', 'More Information');
        siteData = siteData.replace('*|MORE-INFO|*', CardWorker.setMoreInfoContent(comingSoonCard));
        siteData = siteData.replace('*|SMS-PHONE|*', '#');
        siteData = siteData.replace(/\*\|SHARED-LINK\|\*/g, `${req.headers.host}`);
        siteData = siteData.replace(/\*\|VIDEO-URL\|\*/g, '');
        siteData = siteData.replace('*|DIRECTIONS-LI|*', '');
        siteData = siteData.replace('*|PICTURE-URLS|*', JSON.stringify([]));
        siteData = siteData.replace('*|CALENDAR-LINK|*', '');
        siteData = siteData.replace('*|RESUME|*', '');
        siteData = siteData.replace('*|LOGO-URL|*', comingSoonCard.businessLogoThumbnailUrl);
        siteData = siteData.replace('*|VIDEO-REVIEWS-TITLE|*', 'Video Reviews');
        siteData = siteData.replace('*|REVIEW-LOGO-VIEW|*', 'style="display: none"');
        siteData = siteData.replace(
          /\*\|URI-LINK\|\*/g,
          encodeURIComponent(`${req.protocol}://${req.headers.host}${req.originalUrl}`)
        );
        siteData = siteData.replace(/\*\|BASE-URL\|\*/g, `${req.protocol}://${req.headers.host}`);
        siteData = siteData.replace(
          /\*\|QR-URL\|\*/g,
          await generateQR(`${req.protocol}://${req.headers.host}${req.originalUrl}`)
        );
        siteData = siteData.replace('*|VIDEO-ROTATED|*', '');
        siteData = siteData.replace('*|REVIEW-BUTTON-LABEL|*', 'Leave a Review');
        siteData = siteData.replace(
          '*|PREVIEW-BOTTOM|*',
          `
        <div class="welcome-demo">
          <span class="sprite chat">Powered by</span>
          <a href="${req.protocol}://${req.headers.host}">
            <img
              rel="preload"
              src="${req.protocol}://${req.headers.host}/assets/images/logo/pitch59-logo-white.svg"
              alt="Brand"
            />
          </a>
        </div>
      `
        );
        if (!req.query?.i || (req.query?.i && req.query?.i !== 'a')) {
          screenshotMaker(
            comingSoonCard.id,
            siteData.replace('video-thumbnail hidden', 'video-thumbnail')
          );
        }
        res.setHeader('Content-Type', 'text/html');
        res.send(siteData);
        res.end();
        console.log(err);
      });
  }

  async function setMetaTags(req, res) {
    ApiWorker.GetBusinessPitchModelByAlias(req.params.alias)
      .then(async (card) => {
        let siteData = fs.readFileSync(
          path.join(__dirname, '/browser/index.html'),
          'utf8'
        );

        if (card?.data?.data) {
          const metaTags = CardWorker.setMetaTags(
            card.data.data,
            `https://pitch59-prod.s3.amazonaws.com/IP_${card.data.data.id}.jpg`,
            `${req.protocol}://${req.headers.host}`,
            CardWorker.getCardCategories(card.data.data)
          );
          siteData = siteData.split('<meta name="" content="">')[0] + metaTags + siteData.split('<meta name="" content="">')[1];
        } else {
          res.setHeader('Content-Type', 'text/html');
          res.send(siteData);
          res.end();
        }

        res.setHeader('Content-Type', 'text/html');
        res.send(siteData);
        res.end();
      })
      .catch(async (err) => {
        const comingSoonCard = {
          businessType: 'basic',
          title: '',
          id: 0,
          isHideTitle: true,
          videoCoverImageThumbnailUrl: '',
          videoFileUrl: '',
          employeePictureThumnailUrl: '',
          categories: [''],
          facebookLink: '',
          twitterLink: '',
          instagramLink: '',
          linkedinLink: '',
          pinterestLink: '',
          resumeFileUrl: '',
          businessLogoThumbnailUrl: '',
          workingHours: '',
          pricingModel: '',
        };
        let siteData = fs.readFileSync(
          path.join(__dirname, '/browser/index.html'),
          'utf8'
        );

        const metaTags = CardWorker.setMetaTags(
          comingSoonCard,
          `https://pitch59-prod.s3.amazonaws.com/IP_${comingSoonCard.id}.jpg`,
          `${req.protocol}://${req.headers.host}`,
          CardWorker.getCardCategories(comingSoonCard)
        );
        siteData = siteData.split('<meta name="" content="">')[0] + metaTags + siteData.split('<meta name="" content="">')[1];

        res.setHeader('Content-Type', 'text/html');
        res.send(siteData);
        res.end();
      });
  }

  function showDocViewer(url) {
    const resumeFileExtension = url ? url.split('.').pop() : '';
    return (
      resumeFileExtension === 'pdf' ||
      resumeFileExtension === 'doc' ||
      resumeFileExtension === 'docx'
    );
  }

  function setResumeUrl(url) {
    if ((url && url.includes('doc')) || url.includes('docx')) {
      return 'https://view.officeapps.live.com/op/embed.aspx?src=' + url;
    } else {
      return url ? url : '';
    }
  }

  async function generateQR(text) {
    try {
      return await QRCode.toDataURL(text);
    } catch (err) {
      console.error(err);
    }
  }

  function addressFormatter(card) {
    if (card.address) {
      let query = card.address.trim();

      if (
        !query.includes(card.cityName) &&
        !(query.includes(card.stateName) || query.includes(card.stateCode))
      ) {
        if (card.cityName) {
          query += `, ${card.cityName}`;
        }

        if (card?.stateName) {
          query += `, ${card.stateName}`;
        }
      }

      if (!query.includes(card.zip)) {
        if (card.zip) {
          query += `, ${card.zip}`;
        }
      }

      return query;
    } else {
      return '';
    }
  }

  async function dlImageMaker(res, html, fileName) {
    const browser = await puppeteer
      .launch({
        executablePath:
          os.platform() === 'win32'
            ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
            : os.platform() === 'darwin'
            ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
            : '/usr/bin/google-chrome-stable',
        defaultViewport: {
          width: 408,
          height: 623,
        },
      })
      .catch((err) => {
        throw new Error(err);
      });
    const page = await browser.newPage();
    await page.goto(`about:blank`, { waitUntil: 'networkidle0' });
    await page.setContent(html);
    await page.addStyleTag({
      path:
        os.platform() === 'win32'
          ? './browser/assets/card/style.css'
          : './dist/browser/assets/card/style.css',
    });
    await page.addStyleTag({
      path:
        os.platform() === 'win32'
          ? './browser/assets/card/media.css'
          : './dist/browser/assets/card/media.css',
    });
    await page.addStyleTag({ url: 'https://fonts.googleapis.com/css2?family=Lato&display=swap' });
    await page.addScriptTag({
      path:
        os.platform() === 'win32'
          ? './browser/assets/card/card.js'
          : './dist/browser/assets/card/card.js',
    });
    await page.evaluateHandle('document.fonts.ready');
    const screenshot = await page.screenshot({
      omitBackground: true,
    });
    browser.close();
    const imageContents = Buffer.from(screenshot, 'base64');
    const readStream = new stream.PassThrough();
    readStream.end(imageContents);

    res.set('Content-disposition', 'attachment; filename=' + fileName + '.png');
    res.set('Content-Type', 'image/png');

    readStream.pipe(res);
  }

  async function screenshotMaker(businessId, html) {
    const re = /<div class="wrapper hidden">/gi;
    const newHtml = html.replace(re, '<div class="wrapper">');
    const browser = await puppeteer
      .launch({
        executablePath:
          os.platform() === 'win32'
            ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
            : os.platform() === 'darwin'
            ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
            : '/usr/bin/google-chrome-stable',
        defaultViewport: {
          width: 1200,
          height: 628,
        },
      })
      .catch((err) => {
        throw new Error(err);
      });
    const page = await browser.newPage();
    await page.goto(`about:blank`, { waitUntil: 'networkidle0' });
    await page.setContent(newHtml);
    await page.addStyleTag({
      path:
        os.platform() === 'win32'
          ? './browser/assets/card/style.css'
          : './dist/browser/assets/card/style.css',
    });
    await page.addStyleTag({
      path:
        os.platform() === 'win32'
          ? './browser/assets/card/media.css'
          : './dist/browser/assets/card/media.css',
    });
    await page.addStyleTag({
      path:
        os.platform() === 'win32'
          ? './browser/assets/card/modals/style-modals.css'
          : './dist/browser/assets/card/modals/style-modals.css',
    });
    await page.addStyleTag({ url: 'https://fonts.googleapis.com/css2?family=Lato&display=swap' });
    await page.addScriptTag({
      path:
        os.platform() === 'win32'
          ? './browser/assets/card/card.js'
          : './dist/browser/assets/card/card.js',
    });
    await page.evaluateHandle('document.fonts.ready');
    // await page.screenshot({path: 'screenshot.png'});  // For testing purposes
    const screenshot = await page.screenshot();
    browser.close();
    const isPreviewChanged = await ApiWorker.HasPreviewChanged(businessId);
    if (isPreviewChanged && businessId) {
      console.log(`Image of ${businessId} business card is going to be upload!`);
      await ApiWorker.SetPreviewChanged(businessId)
        .then(async (res) => {
          console.log(`Image of ${businessId} business card is going to be upload!`);
          return await BucketWorker.upload(screenshot, `IP_${businessId}`);
        })
        .catch((err) => {
          console.log(err.toString());
        });
    } else if (!businessId) {
      return await BucketWorker.upload(screenshot, `IP_0`);
    } else if (!isPreviewChanged) {
      console.log(`File already exists!`);
    } else {
      console.log(`Something went wrong with preview uploading!`);
    }
  }
}

function run() {
  const port = process.env.PORT || 4000;

  // Start up the Node server
  const server = app();
  // gzip
  server.use(compression());
  // cookies
  server.use(cookieparser());

    // set up health check GET for AWS ECS
    server.get('/health-check', (req, res) => {
        const data = {
            uptime: process.uptime(),
            message: 'OK',
            date: new Date()
        };

        res.status(200).send(data);
    });
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
