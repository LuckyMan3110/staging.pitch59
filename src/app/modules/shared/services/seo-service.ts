import { Injectable } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { SeoTagsModel } from '../models/seo-tags.model';
import { environment } from '../../../../environments/environment';
import { Injector } from '@angular/core';
import { REQUEST } from '@nguniversal/express-engine/tokens';

@Injectable()
export class SeoService {
  constructor(
    private meta: Meta,
    private _injector: Injector,
    private titleService: Title
  ) {
  }

  public setTitle(pageTitle: string) {
    this.titleService.setTitle(`${environment.title} - ${pageTitle}`);
  }

  public generateTags(config: SeoTagsModel) {
    if (config === undefined || config === null) {
      return;
    }
    const g: MetaDefinition[] = new Array<MetaDefinition>();
    const req = this._injector.get(REQUEST);

    if (config.pageTitle) {
      const ogTitle: MetaDefinition = {
        name: 'og:title',
        content: config.pageTitle
      };
      this.titleService.setTitle(
        `${environment.title} - ${config.pageTitle}`
      );
      const title: MetaDefinition = {
        property: 'og:title',
        content: config.pageTitle
      };
      const ogSiteName: MetaDefinition = {
        name: 'site_name',
        property: 'og:site_name',
        content: config.pageTitle
      };
      g.push(title, ogTitle, ogSiteName);
    }

    if (config.description) {
      const ogDesc: MetaDefinition = {
        property: 'og:description',
        content: config.description
      };
      g.push(ogDesc);
    }

    if (config.imageTW) {
      const image: MetaDefinition = {
        property: 'og:image',
        content: config.imageTW
      };
      g.push(image);

      if (config.width && config.heigth) {
        const imageWidth: MetaDefinition = {
          property: 'og:image:width',
          content: config.width
        };
        const imageHeigth: MetaDefinition = {
          property: 'og:image:height',
          content: config.heigth
        };
        g.push(imageWidth, imageHeigth);
      }
    }

    if (config.url) {
      const url: MetaDefinition = {
        property: 'og:url',
        content: config.url
      };
      g.push(url);
    }

    // here content summary twitter card type, from twitter suggestion
    const twitterCard: MetaDefinition = {
      name: 'twitter:card',
      content: 'summary_large_image'
    };
    g.push(twitterCard);

    this.meta.addTags(g, true);
  }
}
