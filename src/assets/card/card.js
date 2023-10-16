const basePath =
    window.location.origin.includes('localhost') ||
    window.location.origin.includes('dev')
        ? 'https://api.p59.dev/api/'
        : 'https://api.pitch59.com/api/';
const cookieExpiery = 7 * 24 * 60 * 60 * 1000;
const bsTypeBasic = 'basic';
const bsTypeNonprofit = 'service';
const bsTypeResume = 'resume';
const bsTypeEmployee = 'employee';
const bsTypeJob = 'job';
const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const LoginUrl = `${basePath}account/login`;
const SendOtpAnonymous = `${basePath}account/send-otpcode-for-anonymous`;
const VerifyOtpUrl = `${basePath}account/verify-otp`;
const OtpVerifyUrl = `${basePath}account/sign-up?otp_check=true`;
const EMAIL_PATTERN =
    /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;
const NAME_PATTERN = new RegExp(['^[A-Za-z ]*$'].join(''));
const US_PHONE_PATTERN = /^\(?([0-9]{3})\) ?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
const DIGITCODE_PATTERN = /^\+?[0-9\-]{4,6}$/;

let parent = document.getElementById('parent');
let gallerySlider = null;
let galleryThumbs = null;
let reviewsSlider = null;
let playModalVideo = false;
let isOtpVerified = false;

let resendInterval;
let timeInMs = 0;
let defaultOtpType = 'phone';
let isCoverLandscape = true;
let isReviewCoverLandscape = true;

let latestKnownViewportHeight = 0;
let ticking = false;
let item = document.querySelectorAll('.item');

let videoPlayer;
let reviewVideoPlayer;
let previewPlayer;
let isFullscreen = false;

let videoDuration;
let countdownTimer;

calcViewportHeight();
listenersInit();

let businessType;

window.onload = () => {
    businessType = document
        .getElementsByClassName(`info-wrap`)[0]
        .getAttribute('data-card-type');
    setScaleFactor();
    InitialPlay();
    calcCover();
    calcNameAndTitleSize();
    window.onorientationchange = function () {
        calcViewportHeight();
        setScaleFactor();
    };
    document.querySelector('.wrapper').classList.remove('hidden');
    document.querySelector('.video-thumbnail').classList.remove('hidden');
};

function setScaleFactor() {
    const vw = Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0
    );
    const vh = Math.min(
        document.documentElement.clientHeight || 0,
        window.innerHeight || 0
    );
    console.log('vw', vw);
    const wrapper = document.querySelector('.wrapper');
    let scaleFactor = vw / (360 + 40); //PitchCard Size + 20px left right margin
    if (window.orientation === 90 || window.orientation === -90) {
        scaleFactor = vh / vw;
    }
    if (scaleFactor * 575 > vh - 100) {
        const newScaleFactor = (vh - 100) / 575;
        if (newScaleFactor < scaleFactor) {
            scaleFactor = newScaleFactor;
        }
    }
    if (vh - (vh / 100) * 30 < scaleFactor * 575) {
        scaleFactor = (vh - (vh / 100) * 20) / 575;
    }
    if (scaleFactor > 1.3) {
        scaleFactor = 1.3;
    }
    wrapper.style.setProperty('--scale-factor', scaleFactor);
}

function calcViewportHeight() {
    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    latestKnownViewportHeight = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty(
        '--vh',
        `${latestKnownViewportHeight}px`
    );

    // We listen to the resize event
    window.addEventListener('resize', onResize, false);
}

function update() {
    // reset the tick so we can
    // capture the next onScroll
    ticking = false;

    document.documentElement.style.setProperty(
        '--vh',
        `${latestKnownViewportHeight}px`
    );
}

function onResize() {
    latestKnownViewportHeight =
        Math.min(
            document.documentElement.clientHeight || 0,
            window.innerHeight || 0
        ) * 0.01; //No IE8
    requestTick();
}

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(update);
    }
    ticking = true;
}

function makeVideoFullScreenOnRotate(videoElement) {
    window.onorientationchange = function () {
        if (window.orientation === 90 || window.orientation === -90) {
            if (videoElement) {
                requestFullScreen(videoElement);
            }
        }
    };
    if (window.orientation === 90 || window.orientation === -90) {
        if (videoElement) {
            requestFullScreen(videoElement);
        }
    }
}

function requestFullScreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    }
}

function calcCover() {
    isCoverLandscape =
        document.getElementById('coverImage').naturalWidth /
        document.getElementById('coverImage').naturalHeight >
        1.33;
    if (isCoverLandscape) {
        document.getElementById('coverImage').style.objectFit = 'cover';
    } else {
        document.getElementById('coverImage').style.objectFit = 'contain';
    }
}

function calcNameAndTitleSize() {
    const nameSize =
        businessType === 'service' || businessType === 'employee'
            ? calcTitleSize()
            : calcNameSize();
    const titleSize =
        businessType === 'service' || businessType === 'employee'
            ? calcNameSize()
            : calcTitleSize();
    const positionSize = calcPositionSize();

    document.documentElement.style.setProperty('--name-size', `${nameSize}`);
    document.documentElement.style.setProperty('--title-size', `${titleSize}`);
    document.documentElement.style.setProperty(
        '--position-size',
        `${positionSize}`
    );
}

function calcNameSize() {
    const nameText = document.querySelector('.business-name').innerText;
    if (!nameText) {
        return 1;
    }

    const koef = nameText.length - 25;

    if (koef < 0) {
        return 1;
    } else {
        return 1 - koef / 100;
    }
}

function calcTitleSize() {
    const titleText = document.querySelector('.business-title').innerText;
    if (!titleText) {
        return 1;
    }

    const koef =
        document.querySelector('.business-title').innerText.length - 25;

    if (koef < 0) {
        return 1;
    } else {
        return 1 - koef / 100;
    }
}

function calcPositionSize() {
    const positionText = document.querySelector('.position').innerText;
    if (!positionText) {
        return 1;
    }

    if (positionText.length - 15 < 0) {
        return 1;
    } else {
        return 1 - (positionText.length + 9) / 100;
    }
}

function calcReviewCovers(url) {
    const img = new Image();
    img.src = url;
    isReviewCoverLandscape = img.naturalWidth / img.naturalHeight > 1.33;
}

function returnLogo(card) {
    return card.businessType === bsTypeResume
        ? 'img/resume-logo.svg'
        : card.businessLogoThumbnailUrl;
}

function getDataTarget(businessType) {
    return businessType === bsTypeResume ? 'modal-doc-viewer' : 'none';
}

function setBusinessName(name) {
    if (name.includes(' | ')) {
        const namesArray = name.split(' | ');
        return `${namesArray[0]} | ${namesArray[1]}`;
    } else {
        return name;
    }
}

function setContactBtnStyle(card) {
    if (
        card.businessType === bsTypeBasic ||
        card.businessType === bsTypeEmployee
    ) {
        return bsTypeBasic + '-gradient';
    } else if (card.businessType === bsTypeNonprofit) {
        return bsTypeNonprofit + '-gradient';
    } else if (card.businessType === bsTypeJob) {
        return bsTypeJob + '-gradient';
    }
}

function setTextColor(card) {
    if (
        card.businessType === bsTypeBasic ||
        card.businessType === bsTypeEmployee
    ) {
        return `${bsTypeBasic}-color`;
    } else if (card.businessType === bsTypeNonprofit) {
        return `${bsTypeNonprofit}-color`;
    } else if (card.businessType === bsTypeJob) {
        return `${bsTypeJob}-color`;
    } else {
        return `${bsTypeResume}-color`;
    }
}

function setRating(businessType) {
    return businessType === bsTypeBasic || businessType === bsTypeEmployee
        ? 'p-grid'
        : 'hide';
}

function setMainInfoHeight(businessType) {
    return businessType === bsTypeBasic || businessType === bsTypeEmployee
        ? 'basic-height'
        : 'expand-height';
}

function setSvgImages(card, partSrc) {
    if (card.businessType === bsTypeNonprofit) {
        return `img/${bsTypeNonprofit}-${partSrc}`;
    } else if (card.businessType === bsTypeResume) {
        return `img/${bsTypeResume}-${partSrc}`;
    } else if (card.businessType === bsTypeJob) {
        return `img/${bsTypeJob}-${partSrc}`;
    } else {
        return `img/${bsTypeBasic}-${partSrc}`;
    }
}

function setReviews(businessType) {
    if (businessType === bsTypeBasic || businessType === bsTypeEmployee) {
        return 'Reviews';
    } else if (businessType === bsTypeNonprofit) {
        return 'Testimonial';
    } else {
        return 'References';
    }
}

function setAttributes(el, attrs) {
    for (let key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}

function InitialPlay() {
    const videoFileUrl = document
        .getElementById(`videoPlayer-0`)
        .getAttribute('data-video');
    previewPlayer = videojs('videoPlayer-0', {
        preload: 'metadata',
        aspectRatio: '16:9',
        controls: false,
        autoplay: false,
        muted: true,
        bigPlayButton: false,
        controlBar: {
            remainingTimeDisplay: false,
            pictureInPictureToggle: false,
            progressControl: {
                seekBar: {
                    mouseTimeDisplay: false,
                    playProgressBar: {
                        timeTooltip: false
                    }
                }
            }
        }
    });
    previewPlayer.el_.style.display = 'block';
    document.getElementById('coverImage').style.display = 'none';
    previewPlayer.src({type: 'application/x-mpegURL', src: videoFileUrl});
    previewPlayer.el_.addEventListener('touchend', function () {
        getModalData(previewPlayer.el_);
    });
}

function onCardTimeUpdate(e) {
    if (!videoDuration) {
        setCountDownTimer(e?.currentTarget?.duration);
    }
    previewPlayer.on('ended', () => {
        previewPlayer.el_.style.display = 'none';
        document.getElementById('coverImage').style.display = 'block';
    });
    if (playModalVideo && previewPlayer) {
        previewPlayer.pause();
        previewPlayer.el_.style.display = 'none';
        document.getElementById('coverImage').style.display = 'block';
        previewPlayer.reset();
    }
}

function setCountDownTimer(duration) {
    if (!duration) {
        return;
    }
    videoDuration = Math.floor(duration);
    const VISIBLE_TIME = 2;
    const FADE_OUT_TIME = 1;
    const el = document.getElementById('countdown-timer');

    if (videoDuration > VISIBLE_TIME) {
        countdownTimer = !countdownTimer ? videoDuration : countdownTimer;
        el.innerText =
            countdownTimer < 10 ? ':0' + countdownTimer : ':' + countdownTimer;

        const timer = setInterval(() => {
            countdownTimer = --countdownTimer;
            el.innerText =
                countdownTimer < 10
                    ? ':0' + countdownTimer
                    : ':' + countdownTimer;

            if (countdownTimer === videoDuration - VISIBLE_TIME) {
                el.classList.add('fade-out');
            }
            if (
                countdownTimer <=
                videoDuration - VISIBLE_TIME - FADE_OUT_TIME
            ) {
                clearInterval(timer);
                countdownTimer = null;
            }
        }, 1000);
    }
}

function showSms(modalId) {
    const userAgent = navigator.userAgent || navigator.vendor;

    if (
        userAgent.match(/iPad/i) ||
        userAgent.match(/iPhone/i) ||
        userAgent.match(/iPod/i)
    ) {
        const a = document.createElement('a');
        const encoded = encodeURIComponent(this.shareUrl);
        a.href = `sms:&body=${encoded}`;
        a.click();
    } else if (userAgent.match(/Android/i)) {
        const a = document.createElement('a');
        const encoded = encodeURIComponent(this.shareUrl);
        a.href = `sms:?body=${encoded}`;
        a.click();
    } else {
        document.getElementById(modalId).classList.add('open');
    }
}

function listenersInit() {
    modalsInit();
}

function modalsInit() {
    document.addEventListener(
        'click',
        function (e) {
            e = e || window.event;
            let target = e.target || e.srcElement;

            if (target.id === 'otpTextCode') {
                sendOtpRequestVerify(true);
            } else if (target.id === 'otpEmailCode') {
                sendOtpRequestVerify(false);
            } else if (target.id === 'otpVerify') {
                verifyOtp(true);
            } else if (target.id === 'sendSmsLink') {
                sendSmsReferralMessage();
            } else if (
                (target.hasAttribute('data-toggle') &&
                    target.getAttribute('data-toggle') == 'modal') ||
                (target.parentNode.hasAttribute('data-toggle') &&
                    target.parentNode.getAttribute('data-toggle') == 'modal') ||
                (target.parentNode.parentNode.hasAttribute('data-toggle') &&
                    target.parentNode.parentNode.getAttribute('data-toggle') ==
                    'modal')
            ) {
                if (
                    (target.hasAttribute('data-target') ||
                        target.parentNode.hasAttribute('data-target') ||
                        target.parentNode.parentNode.hasAttribute(
                            'data-target'
                        )) &&
                    !target.classList.contains('coming-soon')
                ) {
                    let m_ID = target.getAttribute('data-target')
                        ? target.getAttribute('data-target')
                        : target.parentNode.getAttribute('data-target')
                            ? target.parentNode.getAttribute('data-target')
                            : target.parentNode.parentNode.getAttribute(
                                'data-target'
                            );
                    if (m_ID !== 'modal_send_link_via_sms') {
                        document.getElementById(m_ID).classList.add('open');
                    }
                    if (m_ID === 'modal_send_link_via_sms') {
                        showSms(m_ID);
                    }
                    if (
                        target.hasAttribute('data-id') &&
                        target.hasAttribute('data-type') &&
                        !target.classList.contains('coming-soon')
                    ) {
                        getModalData(target);
                    } else if (
                        target.parentNode.hasAttribute('data-id') &&
                        target.parentNode.hasAttribute('data-type') &&
                        !target.classList.contains('coming-soon')
                    ) {
                        getModalData(target.parentNode);
                    } else if (
                        target.parentNode.parentNode.hasAttribute('data-id') &&
                        target.parentNode.parentNode.hasAttribute(
                            'data-type'
                        ) &&
                        !target.classList.contains('coming-soon')
                    ) {
                        getModalData(target.parentNode.parentNode);
                    }
                    e.preventDefault();
                }
            }

            if (
                (target.hasAttribute('data-dismiss') &&
                    target.getAttribute('data-dismiss') == 'modal') ||
                target.classList.contains('modal')
            ) {
                if (
                    !target.hasAttribute('data-g') ||
                    target.hasAttribute('data-close')
                ) {
                    let modal =
                        document.querySelector('[class="modal open"]') ||
                        document.querySelector(
                            '[class="modal dropdown open"]'
                        ) ||
                        document.querySelector('[class="modal modal-g open"]');
                    if (modal) {
                        if (target.hasAttribute('data-close')) {
                            modal = document.getElementById(
                                'modal-authentification-choose'
                            );
                        }
                        if (
                            target.id === 'reviews' &&
                            !target.hasAttribute('data-review')
                        ) {
                            return;
                        }
                        if (
                            target.getAttribute('data-close') ===
                            'reviews-video' ||
                            target.id === 'modal-reviews-video'
                        ) {
                            modal = document.getElementById(
                                'modal-reviews-video'
                            );
                        }
                        if (
                            target.getAttribute('data-close') ===
                            'what-is-pitch-video' ||
                            target.id === 'modal-what-is-pitch-video'
                        ) {
                            modal = document.getElementById(
                                'modal-what-is-pitch-video'
                            );
                        }
                        if (target.getAttribute('data-close') === 'gallery') {
                            modal = document.getElementById(
                                'modal_dialog_slider'
                            );
                        }
                        if (target.getAttribute('data-close') === 'sendSms') {
                            modal = document.getElementById(
                                'modal_send_link_via_sms'
                            );
                        }
                        if (
                            target.getAttribute('data-close') === 'auth-modal'
                        ) {
                            modal = document.getElementById('authClose');
                        }
                        if (
                            target.getAttribute('data-close') ===
                            'job-auth-modal'
                        ) {
                            modal = document.getElementById('jobAuthClose');
                        }
                        if (
                            target.getAttribute('data-close') === 'modal-login'
                        ) {
                            modal = document.getElementById('modal-login');
                        }
                        if (
                            target.getAttribute('data-close') ===
                            'modal_dialog_1'
                        ) {
                            modal = document.getElementById('modal_dialog_1');
                        }
                        if (target.dataset.review === 'review') {
                            document.getElementById('reviewBullets').innerHTML =
                                '';
                            document.getElementById('reviewsSlider').innerHTML =
                                '';
                            modal.classList.remove('open');
                            reviewsSlider.destroy();
                        }
                        stopMainVideo();
                        modal.classList.remove('open');
                        if (
                            target.id === 'modal_dialog_slider' ||
                            target.hasOwnProperty(' data-g')
                        ) {
                            updateGallery();
                            totalUpdateGallery();
                        }
                    }
                } else {
                    let modal = document.querySelector(
                        '[class="modal modal-g open"]'
                    );
                    if (modal) {
                        stopMainVideo();
                        modal.classList.remove('open');
                        if (
                            target.id === 'modal_dialog_slider' ||
                            target.hasOwnProperty(' data-g')
                        ) {
                            updateGallery();
                            totalUpdateGallery();
                        }
                        if (target.hasOwnProperty('data-review')) {
                            document.getElementById('reviewsSlider').innerHTML =
                                '';
                            reviewsSlider.update();
                        }
                    }
                }
                e.preventDefault();
            }
            if (
                e.target.hasAttribute('data-target') &&
                e.target.getAttribute('data-target') == 'calendar-link'
            ) {
                showCalendar(e.target.getAttribute('data-id'));
            }
            if (
                e.target.parentNode.hasAttribute('data-target') &&
                e.target.parentNode.getAttribute('data-target') ==
                'calendar-link'
            ) {
                showCalendar(e.target.parentNode.getAttribute('data-id'));
            }
            if (
                e.target.parentNode.parentNode.hasAttribute('data-target') &&
                e.target.parentNode.parentNode.getAttribute('data-target') ==
                'calendar-link'
            ) {
                showCalendar(
                    e.target.parentNode.parentNode.getAttribute('data-id')
                );
            }
        },
        false
    );
}

function showCalendar(calendarLink) {
    if (calendarLink) {
        if (calendarLink.includes('calendly')) {
            Calendly.showPopupWidget(calendarLink, null, {
                parentElement: document.getElementsByClassName(
                    'banner-search-wrap container'
                )[0]
            });
            return false;
        } else {
            window.open(calendarLink, '_blank');
        }
    }
}

function getModalData(element) {
    if (element) {
        if (element.id === 'videoPlayer-0') {
            populateVideoModal();
        } else {
            const cardId = element.getAttribute('data-id');
            const cardType = element.getAttribute('data-card-type');

            if (element.getAttribute('data-type') === 'video') {
                populateVideoModal();
            }

            if (element.getAttribute('data-type') === 'save') {
                populateAccountStatusModal();
            }

            if (element.getAttribute('data-type') === 'reviews') {
                populateReviewsModal(cardId);
            }

            if (element.getAttribute('data-type') === 'reviews-video') {
                populateReviewsVideoModal(
                    element.getAttribute('data-id'),
                    element.children[0].getAttribute('data-src')
                );
            }

            if (element.getAttribute('data-type') === 'what-is-pitch-video') {
                populateWhatIsPitchVideoModal();
            }

            if (element.getAttribute('data-type') === 'contacts') {
                populateContactsData(element);
            }

            if (element.getAttribute('data-type') === 'real-gallery') {
                populatePhotosData(
                    JSON.parse(
                        document
                            .getElementById('modal_dialog_slider')
                            .getAttribute('data-pictures')
                    ),
                    JSON.parse(
                        document
                            .getElementById('modal_dialog_slider')
                            .getAttribute('data-thumbnails')
                    )
                );
            }

            if (element.getAttribute('data-type') === 'share') {
                populateShareData();
            }
            if (element.getAttribute('data-type') === 'share') {
                populateSendSmsData();
            }
        }
    }
}

function populateVideoModal() {
    const videoFileUrl = document
        .getElementById(`videoPlayer-0`)
        .getAttribute('data-video');
    console.log(videoFileUrl);
    videoPlayer = videojs('my-player', {
        preload: 'metadata',
        aspectRatio: '16:9',
        controls: true,
        autoplay: false,
        muted: false,
        bigPlayButton: false,
        controlBar: {
            remainingTimeDisplay: false,
            pictureInPictureToggle: false,
            progressControl: {
                seekBar: {
                    mouseTimeDisplay: false,
                    playProgressBar: {
                        timeTooltip: false
                    }
                }
            }
        }
    });
    videoPlayer.src({type: 'application/x-mpegURL', src: videoFileUrl});
    playModalVideo = true;
}

function populateWhatIsPitchVideoModal() {
    const videoFileUrl = document
        .getElementById(`videoPlayer-0`)
        .getAttribute('data-video');
    console.log(videoFileUrl);
    videoPlayer = videojs('what-is-pitch-player', {
        preload: 'metadata',
        aspectRatio: '16:9',
        controls: true,
        autoplay: false,
        muted: false,
        bigPlayButton: false,
        controlBar: {
            remainingTimeDisplay: false,
            pictureInPictureToggle: false,
            progressControl: {
                seekBar: {
                    mouseTimeDisplay: false,
                    playProgressBar: {
                        timeTooltip: false
                    }
                }
            }
        }
    });
    videoPlayer.src({
        type: 'application/x-mpegURL',
        src: 'https://stream.mux.com/M3C00pyabzoEOMISZPlHc5RW2nDt3keit.m3u8'
    });
    playModalVideo = true;
}

function stopMainVideo() {
    if (videoPlayer) {
        if (!videoPlayer.paused()) {
            videoPlayer.pause();
        }
        videoPlayer.reset();
    }
    if (reviewVideoPlayer) {
        if (!reviewVideoPlayer.paused()) {
            reviewVideoPlayer.pause();
        }
        reviewVideoPlayer.reset();
    }
}

function populateReviewsModal(cardId) {
    let reviews;
    getReviewsByBsId(cardId).then((data) => {
        if (businessType !== bsTypeBasic) {
            document.querySelector('.summary-rating').style.display = 'none';
            document.querySelector('.tag-categories').style.display = 'none';
        }

        reviews = JSON.parse(data.body).data;
        document.getElementById('reviewsBsName').innerText =
            reviews.businessName;

        document.getElementById('tagCategories').innerText = removeLastTags(
            reviews.categories
        );
        const averageRating = returnAverageRate(reviews);
        document.getElementById('averageRate').innerText = averageRating;

        if (
            document.getElementById('serviceRate').childNodes.length === 0 &&
            document.getElementById('qualityRate').childNodes.length === 0
        ) {
            setMainRate(
                reviews.customerService,
                document.getElementById('serviceRate')
            );
            setMainRate(
                reviews.quality,
                document.getElementById('qualityRate')
            );
        }

        setHeaderStyle();
        setRatingSlider(reviews);
        setRatingColors(averageRating);
        setPaginationColor(reviews.businessType);
    });
}

function populateReviewsVideoModal(reviewId, videoUrl) {
    console.log(videoUrl);
    reviewVideoPlayer = videojs('my-reviews-player', {
        preload: 'metadata',
        aspectRatio: '16:9',
        controls: true,
        autoplay: false,
        muted: false,
        bigPlayButton: false,
        controlBar: {
            remainingTimeDisplay: false,
            pictureInPictureToggle: false,
            progressControl: {
                seekBar: {
                    mouseTimeDisplay: false,
                    playProgressBar: {
                        timeTooltip: false
                    }
                }
            }
        }
    });
    reviewVideoPlayer.src({type: 'application/x-mpegURL', src: videoUrl});
}

function getReviewsByBsId(cardId) {
    return makeRequest(
        'GET',
        `${basePath}customer-analytics/${cardId}/reviews`
    );
}

function setMainRate(rate, parentNode) {
    let serviceStars = setCountStars(rate);
    serviceStars.map((star) => {
        let img = parentNode.appendChild(document.createElement('img'));
        img.classList.add('main-rate');
        img.src = star;
    });
}

function setCountStars(rating) {
    let urls = [];
    let i = 0;
    while (i < 5) {
        let starUrl = '';
        let currentStar = i + 1;
        if (rating > currentStar || rating === currentStar) {
            if (
                rating - currentStar >= 1 ||
                rating - currentStar === 0 ||
                (rating - currentStar > 0 && rating - currentStar < 1)
            ) {
                starUrl = '/assets/card/img/star.svg';
            }
        } else if (currentStar - rating > 0 && currentStar - rating < 1) {
            starUrl = '/assets/card/img/star-half.svg';
        } else {
            starUrl = '/assets/card/img/star-blank.svg';
        }
        urls.push(starUrl);
        i++;
    }
    return urls;
}

function removeLastTags(tagCategories) {
    let tagString = tagCategories.join('  ●  ');
    const oneLetterWidth = 7.8;
    const containerWidth =
        document.getElementById('summaryContainer').clientWidth;
    if (tagString) {
        let symbols = tagString.length;

        while (symbols * oneLetterWidth > containerWidth) {
            symbols--;
            tagString = tagString.substring(0, symbols - 1);
        }

        const lastElementIndex = tagString.lastIndexOf('  ●  ');

        tagString = tagString.slice(0, lastElementIndex);
    }

    return tagString;
}

function setRatingColors(averageRating) {
    let textElements = document.getElementsByClassName('rating-text');
    const pinkLevel = averageRating >= 0 && averageRating < 3;
    const goldLevel = averageRating >= 3 && averageRating < 4;
    const greenLevel = averageRating >= 4 || averageRating < 0;
    let i = 0;
    for (let el of textElements) {
        if (greenLevel) {
            textElements[i].classList.add('bfr-green');
        }
        if (goldLevel) {
            textElements[i].classList.add('bfr-gold');
        }
        if (pinkLevel) {
            textElements[i].classList.add('bfr-gold');
        }
        i++;
    }
}

function setPaginationColor(bsType) {
    let activeBullet = document.getElementsByClassName(
        'swiper-pagination-bullet-active-main'
    )[0];
    if (bsType === bsTypeBasic || (bsType === bsTypeEmployee && activeBullet)) {
        activeBullet.classList.add(bsTypeBasic);
    } else if (bsType === bsTypeNonprofit && activeBullet) {
        activeBullet.classList.add(bsTypeNonprofit);
    } else if (bsType === bsTypeJob && activeBullet) {
        activeBullet.classList.add(bsTypeJob);
    } else if (activeBullet) {
        activeBullet.classList.add(bsTypeResume);
    }
}

function setHeaderStyle() {
    const reviewLogo = document.getElementById('reviewsCompanyLogo');
    const parentEl = reviewLogo.parentNode;
    reviewLogo.getAttribute('src')
        ? parentEl.setAttribute('style', 'justify-content: space-between')
        : parentEl.setAttribute('style', 'justify-content: flex-end');
}

function setRatingSlider(reviewsData) {
    if (reviewsData.reviews.length < 4 && reviewsData.reviews.length >= 1) {
        hideNavigationOnRatingSlider();
    }
    if (reviewsData.reviews.length > 1) {
        reviewsData.reviews.map((review, index) => {
            let slide = document
                .getElementById('reviewsSlider')
                .appendChild(document.createElement('div'));
            slide.classList.add('swiper-slide', 'review-slide');
            calcReviewCovers(review.videoReviewThumbnailUrl);
            slide.innerHTML = `
            <div class="review-container">
                <div class="review-video" data-toggle="modal" data-type="reviews-video" data-id="${
                review.id
            }" data-target="modal-reviews-video">
                    <img
                        src="${review.videoReviewThumbnailUrl}?time=0"
                        data-src="${review.videoReviewUrl}"
                        alt="Video cover"
                        style="object-fit: ${
                isReviewCoverLandscape ? 'cover' : 'contain'
            }"
                    >
                    <img class="play play-review" src="/assets/card/img/play-icon.svg" alt="Play icon">
                    </div>
                    <div class="review-info">
                        <div class="user-info">
                            <div>
                                <span class="user-name">${
                review.user.firstName
            }</span>
                                <span class="user-address">${
                review.user.address
                    ? review.user.address
                    : ''
            }</span>
                            </div>
                            <div class="secondary-info">
                                <span>${returnDate(review.createdAt)}</span>
                            </div>
                        </div>
                        <div class="report-review">
                            <div class="rating-box ${setRateBoxBorder(review)}">
                                <div class="box-top ${setRateColor(
                review
            )}">${returnAverageRate(review)}</div>
                                <div class="box-bottom ${setRateBg(
                review
            )}"> out of 5 </div>
                            </div>
                            <div class="marks-stars">
                                <div class="report-rating-block">
                                    <span>Customer Service</span>
                                    <div class="rating-stars" id="service-${index}"></div>
                                </div>
                                <div class="report-rating-block">
                                    <span>Quality</span>
                                    <div class="rating-stars" id="quality-${index}" ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
            if (
                document.getElementById(`service-${index}`).childNodes
                    .length === 0 &&
                document.getElementById(`quality-${index}`).childNodes
                    .length === 0
            ) {
                setMainRate(
                    review.customerService,
                    document.getElementById(`service-${index}`)
                );
                setMainRate(
                    review.quality,
                    document.getElementById(`quality-${index}`)
                );
            }
        });

        reviewsSliderInit(reviewsData);
    } else if (reviewsData.reviews.length === 1) {
        let slide = document
            .getElementById('reviewsSlider')
            .appendChild(document.createElement('div'));
        slide.classList.add('swiper-slide', 'review-slide');
        slide.innerHTML = `
        <div class="review-container">
            <div class="review-video" data-toggle="modal" data-type="reviews-video" data-id="${
            reviewsData.reviews[0].id
        }" data-target="modal-reviews-video">
            <img
                src="${reviewsData.reviews[0].videoReviewThumbnailUrl}?time=0"
                data-src="${reviewsData.reviews[0].videoReviewUrl}"
                alt="Video cover"
                style="object-fit: ${
            isReviewCoverLandscape ? 'cover' : 'contain'
        }"
            >
                <img class="play play-review" src="/assets/card/img/play-icon.svg" alt="Play icon">
            </div>
            <div class="review-info">
                <div class="user-info">
                    <div>
                        <span class="user-name">${
            reviewsData.reviews[0].user.firstName
        }</span>
                        <span class="user-address">${
            reviewsData.reviews[0].user.address
                ? reviewsData.reviews[0].user.address
                : ''
        }</span>
                    </div>
                    <div class="secondary-info">
                        <span>${returnDate(
            reviewsData.reviews[0].createdAt
        )}</span>
                    </div>
                </div>
                <div class="report-review" style="display: ${
            businessType === bsTypeBasic ? 'flex' : 'none'
        }">
                    <div class="rating-box ${setRateBoxBorder(
            reviewsData.reviews[0]
        )}">
                        <div class="box-top ${setRateColor(
            reviewsData.reviews[0]
        )}">${returnAverageRate(reviewsData.reviews[0])}</div>
                        <div class="box-bottom ${setRateBg(
            reviewsData.reviews[0]
        )}"> out of 5 </div>
                    </div>
                    <div class="marks-stars">
                        <div class="report-rating-block">
                            <span>Customer Service</span>
                            <div class="rating-stars" id="service-${0}"></div>
                        </div>
                        <div class="report-rating-block">
                            <span>Quality</span>
                            <div class="rating-stars" id="quality-${0}" ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        if (
            document.getElementById(`service-${0}`).childNodes.length === 0 &&
            document.getElementById(`quality-${0}`).childNodes.length === 0
        ) {
            setMainRate(
                reviewsData.reviews[0].customerService,
                document.getElementById(`service-${0}`)
            );
            setMainRate(
                reviewsData.reviews[0].quality,
                document.getElementById(`quality-${0}`)
            );
        }
    }
    if (reviewsData.reviews.length === 0) {
        document
            .querySelector('.swiper-button-next.next.preview-right')
            .setAttribute('style', 'display: none;');
        document
            .querySelector('.swiper-button-prev.prev.preview-left')
            .setAttribute('style', 'display: none;');
    }
}

function hideNavigationOnRatingSlider() {
    const pagination = document.getElementsByClassName('reviews-bullets')[0];
    const arrowLeft = document.getElementsByClassName('preview-left')[0];
    const arrowRight = document.getElementsByClassName('preview-right')[0];
    pagination.classList.add('d-none');
    arrowLeft.classList.add('d-none');
    arrowRight.classList.add('d-none');
}

function returnDate(dateInSec) {
    let date = new Date(dateInSec);
    let day = date.getDay().length > 1 ? date.getDay() : `0${date.getDay()}`;
    let month =
        date.getMonth().length > 1 ? date.getMonth() : `0${date.getMonth()}`;
    let year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function pinkCondition(averageRating) {
    return averageRating >= 0 && averageRating < 3;
}

function goldCondition(averageRating) {
    return averageRating >= 3 && averageRating < 4;
}

function greenCondition(averageRating) {
    return averageRating >= 4 || averageRating < 0;
}

function returnAverageRate(review) {
    return ((+review.customerService + +review.quality) / 2).toFixed(1);
}

function setRateBoxBorder(review) {
    const averageRating = returnAverageRate(review);
    if (pinkCondition(averageRating)) {
        return 'bd-pink';
    }
    if (goldCondition(averageRating)) {
        return 'bd-gold';
    }
    if (greenCondition(averageRating)) {
        return 'bd-green';
    }
}

function setRateBg(review) {
    const averageRating = returnAverageRate(review);
    if (pinkCondition(averageRating)) {
        return 'bg-pink';
    }
    if (goldCondition(averageRating)) {
        return 'bg-gold';
    }
    if (greenCondition(averageRating)) {
        return 'bg-green';
    }
}

function setRateColor(review) {
    const averageRating = returnAverageRate(review);
    if (pinkCondition(averageRating)) {
        return 'pink';
    }
    if (goldCondition(averageRating)) {
        return 'gold';
    }
    if (greenCondition(averageRating)) {
        return 'green';
    }
}

function populateAccountStatusModal() {
    let loginTrigger = document.getElementById('loginTrigger');
    let signUpTrigger = document.getElementById('signUpTrigger');
    let loginBtn = document.getElementById('loginBtn');
    let signUpBtn = document.getElementById('signUpBtn');
    let loginModal = document.getElementById('modal-login');
    let signUpModal = document.getElementById('modal_dialog_1');

    let firstNameInput = document.getElementById('firstName');
    let lastNameInput = document.getElementById('lastName');
    let contactNumberInput = document.getElementById('contactNumber');
    let emailIdInput = document.getElementById('emailId');

    loginTrigger.addEventListener('click', () => {
        signUpModal.classList.remove('open');
        loginModal.classList.add('open');
    });
    signUpTrigger.addEventListener('click', () => {
        loginModal.classList.remove('open');
        signUpModal.classList.add('open');
    });
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        login(e.target);
    });
    signUpBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signUp(e.target);
    });
    firstNameInput.addEventListener('blur', () => checkOtpAvailable());
    lastNameInput.addEventListener('blur', () => checkOtpAvailable());
    contactNumberInput.addEventListener('blur', () => checkOtpAvailable());
    emailIdInput.addEventListener('blur', () => checkOtpAvailable());
    if (contactNumberInput) {
        contactNumberInput.addEventListener('input', function (e) {
            let x = e.target.value
                .replace(/\D/g, '')
                .match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
            e.target.value = !x[2]
                ? x[1]
                : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });
    }
}

function populateContactsData(contactBtn) {
    let dropdown = document.getElementById('modal_dropdown');
    contactBtn = document.getElementById('contactBtn');
    dropdown.childNodes[1].style.width =
        window.innerWidth > 650 ? contactBtn.clientWidth + 'px' : '100%';
    dropdown.childNodes[1].style.top =
        window.innerWidth > 650
            ? contactBtn.getBoundingClientRect().top +
            contactBtn.ownerDocument.defaultView.pageYOffset +
            'px'
            : 'unset';
}

function populatePhotosData(employeeImgFileIds, employeeImgThumbnailsIds) {
    employeeImgFileIds.map((imgUrl) => {
        let realGallery = document
            .getElementById('real-gallery')
            .appendChild(document.createElement('div'));
        realGallery.classList.add('swiper-slide', 'gallery-slide');
        let galleryImg = realGallery.appendChild(document.createElement('img'));
        galleryImg.src = imgUrl;
    });
    employeeImgThumbnailsIds.map((imgUrl) => {
        let galleryThumbsSlide = document
            .getElementById('gallery-thumbs')
            .appendChild(document.createElement('div'));
        galleryThumbsSlide.classList.add('swiper-slide', 'thumbs-slide');
        let thumbsImg = galleryThumbsSlide.appendChild(
            document.createElement('img')
        );
        thumbsImg.src = imgUrl;
        galleryThumbsSlide.style.overflow = 'hidden';
        setTimeout(() => {
            if (
                galleryThumbsSlide.clientHeight <
                galleryThumbsSlide.clientWidth / 1.33
            ) {
                galleryThumbsSlide.style.height =
                    galleryThumbsSlide.clientWidth / 1.33 + 'px';
            } else {
                galleryThumbsSlide.style.width =
                    galleryThumbsSlide.clientHeight * 1.33 + 'px';
            }
        }, 1000);
    });
    populateGallery();
    if (employeeImgFileIds.length === 1) {
        removeNavigationButtons();
    } else {
        enableNavigationButtons();
    }
    updateGallery();
}

function removeNavigationButtons() {
    document
        .getElementsByClassName('swiper-photo-prev')[0]
        .setAttribute('style', 'display: none;');
    document
        .getElementsByClassName('swiper-photo-next')[0]
        .setAttribute('style', 'display: none;');
}

function enableNavigationButtons() {
    document
        .getElementsByClassName('swiper-photo-prev')[0]
        .removeAttribute('style');
    document
        .getElementsByClassName('swiper-photo-next')[0]
        .removeAttribute('style');
}

function groupEqualTime(workDays) {
    let workingHoursGroups = [];

    workDays.forEach((timesheet) => {
        if (!checkExistedHours(workingHoursGroups, timesheet)) {
            workingHoursGroups.push({
                openHours: timesheet.open.hours,
                openMinutes: timesheet.open.minutes,
                closeHours: timesheet.close.hours,
                closeMinutes: timesheet.close.minutes,
                [weekDays[timesheet.weekDay]]: true
            });
        }
    });
    return workingHoursGroups;
}

function checkExistedHours(workingHoursGroups, timesheet) {
    return workingHoursGroups.some((object, index) => {
        const equalHours =
            object.openHours === timesheet.open.hours &&
            object.openMinutes === timesheet.open.minutes &&
            object.closeHours === timesheet.close.hours &&
            object.closeMinutes === timesheet.close.minutes;

        if (equalHours) {
            workingHoursGroups[index] = {
                ...workingHoursGroups[index],
                [weekDays[timesheet.weekDay]]: true
            };
            return true;
        }

        return false;
    });
}

function populateShareData() {
    document
        .getElementById('copy-button')
        .addEventListener('click', (event) => {
            event.preventDefault();
            document.getElementById('copy').select();
            document.execCommand('copy');
        });
}

function populateSendSmsData() {
    let smsLinkNumberInput = document.getElementById('sendSmsNumber');
    if (smsLinkNumberInput) {
        smsLinkNumberInput.addEventListener('input', function (e) {
            let x = e.target.value
                .replace(/\D/g, '')
                .match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
            e.target.value = !x[2]
                ? x[1]
                : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });
    }
}

function setMainSlider() {
    let swiper = new Swiper('.cards-slider', {
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        },
        updateOnWindowResize: true,
        loop: true,
        slidesPerView: 3,
        effect: 'coverflow',
        grabCursor: true,
        coverflowEffect: {
            rotate: 0,
            depth: 400,
            modifier: 1,
            slideShadows: false
        },
        breakpoints: {
            992: {
                effect: 'coverflow',
                spaceBetween: 0,
                coverflowEffect: {
                    depth: 400
                }
            },
            670: {
                effect: 'coverflow',
                longSwipes: false,
                shortSwipes: true,
                slidesPerView: 3,
                spaceBetween: 16,
                coverflowEffect: {
                    depth: 200
                }
            },
            320: {
                effect: 'slide',
                centeredSlides: true,
                observeSlideChildren: true,
                shortSwipes: false,
                slidesPerView: 2.5,
                spaceBetween: 0,
                coverflowEffect: {
                    depth: 0,
                    modifier: 0
                }
            }
        },
        autoplay: false,
        speed: 500,
        initialSlide: 0,
        observer: true,
        longSwipes: false,
        shortSwipes: false,
        preventInteractionOnTransition: true,
        preventClicks: true
    });
}

function totalUpdateGallery() {
    if (gallerySlider) {
        document.getElementById('real-gallery').innerHTML = '';
    }
    if (galleryThumbs) {
        document.getElementById('gallery-thumbs').innerHTML = '';
    }
}

function reviewsSliderInit(reviewsData) {
    reviewsSlider = new Swiper('.reviews-slider', {
        loop: reviewsData.reviews.length >= 4,
        navigation: {
            nextEl: '.swiper-button-next.preview-right',
            prevEl: '.swiper-button-prev.preview-left'
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },
        breakpoints: {
            1280: {
                slidesPerView:
                    reviewsData.reviews.length < 4
                        ? reviewsData.reviews.length
                        : 4
            },
            980: {
                slidesPerView: 3
            },
            767: {
                slidesPerView: 2
            }
        },
        preventClicks: true,
        preventClicksPropagation: true,
        initialSlide: 0,
        updateOnWindowResize: true,
        loopedSlides: 0
    });
}

function populateGallery() {
    galleryThumbs = new Swiper('.gallery-thumbs', {
        spaceBetween: 10,
        slidesPerView: 4,
        freeMode: true,
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
        loopedSlides: 0,
        loop: false
    });
    gallerySlider = new Swiper('.real-gallery', {
        navigation: {
            nextEl: '.swiper-photo-next',
            prevEl: '.swiper-photo-prev'
        },
        loop: false,
        preventClicks: true,
        preventClicksPropagation: true,
        initialSlide: 0,
        thumbs: {
            swiper: galleryThumbs
        },
        updateOnWindowResize: true,
        loopedSlides: 0
    });
    updateGallery();
}

function updateGallery() {
    galleryThumbs.update();
    gallerySlider.update();
}

function sendLoginForm() {
    let loginForm = {
        emailId: document.getElementById('emailAddress').value,
        password: document.getElementById('pass').value
    };
    if (
        fieldValidation(loginForm.emailId, EMAIL_PATTERN) &&
        isPassValid(loginForm.password)
    ) {
        sendRequest(LoginUrl, 'POST', loginForm).then((res) => {
            if (res.ok) {
                console.log(res);
            } else {
                showErrorMessageFromServer(res.data, 1);
            }
        });
    }
}

function login(el) {
    makeRequest(
        'POST',
        `${basePath}account/login?tokenize=false`,
        JSON.stringify({
            emailId: document.getElementById('emailAddress').value,
            password: document.getElementById('pass').value
        })
    )
        .then((res) => {
            localStorage.setItem(
                'userDetails',
                JSON.stringify(JSON.parse(res.body).data)
            );
            var arr = res.headers.trim().split(/[\r\n]+/);
            // Create a map of header names to values
            var headerMap = {};
            arr.forEach(function (line) {
                var parts = line.split(': ');
                var header = parts.shift();
                var value = parts.join(': ');
                headerMap[header] = value;
            });
            setCookie('Token', headerMap.authorization, {
                expires: new Date(new Date().getTime() + cookieExpiery)
            });
            let searchType = 'basic.employee';

            const businessType = el.getAttribute('data-card-type');

            if (businessType == 'job') {
                searchType = 'job';
            }

            if (businessType == 'resume') {
                searchType = 'resume';
            }

            if (businessType == 'service') {
                searchType = 'nonprofit';
            }

            document.location.href =
                window.location.origin +
                `/search?types=${searchType}&id=${el.getAttribute('data-id')}`;
        })
        .catch((err) => {
            console.log(err);
        });
}

async function sendRequest(url, method, body) {
    let myHeaders = new Headers({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://untitle1/#',
        'Access-Control-Allow-Credentials': 'true'
    });
    let otherParam = {
        headers: myHeaders,
        body: JSON.stringify(body),
        method: method
    };
    return fetch(url, otherParam).then((data) => {
        return {data: data.json(), ok: data.ok};
    });
}

function fieldValidation(fieldValue, pattern) {
    return pattern.test(fieldValue);
}

function isPassValid(password) {
    return password.length >= 4;
}

function signUp(el) {
    let signUpForm = {
        firstName: {
            value: document.getElementById('firstName').value,
            title: 'First Name',
            valid: false
        },
        lastName: {
            value: document.getElementById('lastName').value,
            title: 'Last Name',
            valid: false
        },
        contactNumber: {
            value: document.getElementById('contactNumber').value,
            title: 'Mobile Number',
            valid: false
        },
        emailId: {
            value: document.getElementById('emailId').value,
            title: 'Email ID',
            valid: false
        },
        otpCode: {
            value: document.getElementById('otpCode').value,
            title: 'OTP Code',
            valid: isOtpVerified
        },
        refemailId: {
            value: document.getElementById('refemailId').value,
            title: 'Email Address of Referrer',
            valid: true
        },
        password: {
            value: document.getElementById('password').value,
            title: 'Password',
            valid: false
        },
        terms: {
            value: document.getElementById('terms').checked,
            title: 'Terms and conditions',
            valid: false
        },
        zipCode: {
            value: document.getElementById('zipCode').value,
            title: 'Zip code',
            valid: true
        }
    };
    clearFieldsErrorsMessages();
    clearMessagesFromServer('form-errors');
    let validationObject = isSignUpFormValid(signUpForm);
    if (validationObject.valid) {
        makeRequest(
            'POST',
            `${basePath}account/sign-up?otp_check=true&tokenize=false`,
            JSON.stringify({
                firstName: signUpForm.firstName.value,
                lastName: signUpForm.lastName.value,
                contactNumber: signUpForm.contactNumber.value,
                emailId: signUpForm.emailId.value,
                otpCode: signUpForm.otpCode.value,
                refemailId: signUpForm.refemailId.value,
                password: signUpForm.password.value,
                terms: signUpForm.terms.value,
                zipCode: signUpForm.zipCode.value
            })
        )
            .then((res) => {
                localStorage.setItem(
                    'userDetails',
                    JSON.stringify(JSON.parse(res.body).data)
                );
                var arr = res.headers.trim().split(/[\r\n]+/);
                // Create a map of header names to values
                var headerMap = {};
                arr.forEach(function (line) {
                    var parts = line.split(': ');
                    var header = parts.shift();
                    var value = parts.join(': ');
                    headerMap[header] = value;
                });
                setCookie('Token', headerMap.authorization, {
                    expires: new Date(new Date().getTime() + cookieExpiery)
                });
                document.location.href =
                    window.location.origin +
                    `/search?id=${el.getAttribute('data-id')}`;
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        validationObject.unValidFields.map((field) => {
            let error = document.createElement('div');
            error.classList.add('form-error');
            error.innerText = `${validationObject.form[field].title} required`;
            document.getElementById(field).parentNode.appendChild(error);
        });
    }
}

function clearFieldsErrorsMessages() {
    let errors = document.getElementsByClassName('form-error');
    if (errors && errors.length > 0) {
        for (let i = errors.length - 1; i >= 0; i--) {
            errors[i].remove();
        }
    }
}

function clearMessagesFromServer(className) {
    let errors = document.getElementsByClassName(className);
    if (errors && errors.length > 0) {
        for (let i = errors.length - 1; i >= 0; i--) {
            errors[i].innerText = '';
        }
    }
}

function isSignUpFormValid(form) {
    let validationObject = {form: form, valid: true, unValidFields: []};
    form.firstName.valid =
        fieldValidation(form.firstName.value, NAME_PATTERN) &&
        form.firstName.value.length > 0;
    form.lastName.valid =
        fieldValidation(form.lastName.value, NAME_PATTERN) &&
        form.lastName.value.length > 0;
    form.contactNumber.valid = form.contactNumber.value.length > 0;
    form.emailId.valid =
        fieldValidation(form.emailId.value, EMAIL_PATTERN) &&
        form.emailId.value.length > 0;
    form.refemailId.value.length > 0
        ? (form.refemailId.valid = !!fieldValidation(
            form.refemailId.value,
            EMAIL_PATTERN
        ))
        : (form.refemailId.valid = true);
    form.password.valid =
        form.password.value.length > 4 &&
        form.password.value ===
        document.getElementById('password-confirm').value;
    form.terms.valid = form.terms.value;
    Object.keys(form).map((control) => {
        if (!form[control].valid) {
            validationObject.valid = false;
            validationObject.unValidFields.push(control);
            return validationObject;
        }
    });
    return validationObject;
}

function isFormValidForOtp(form) {
    let validationObject = {form, valid: true, unValidFields: []};
    form.firstName.valid =
        fieldValidation(form.firstName.value, NAME_PATTERN) &&
        form.firstName.value.length > 0;
    form.lastName.valid =
        fieldValidation(form.lastName.value, NAME_PATTERN) &&
        form.lastName.value.length > 0;
    form.contactNumber.valid = form.contactNumber.value.length > 0;
    form.emailId.valid =
        fieldValidation(form.emailId.value, EMAIL_PATTERN) &&
        form.emailId.value.length > 0;
    Object.keys(form).map((control) => {
        if (!form[control].valid) {
            validationObject.valid = false;
            validationObject.unValidFields.push(control);
            return validationObject;
        }
    });
    return validationObject;
}

function checkOtpAvailable() {
    document.getElementById('otpTextCode').disabled = true;
    let otpValidationForm = {
        firstName: {
            value: document.getElementById('firstName').value,
            title: 'First Name',
            valid: false
        },
        lastName: {
            value: document.getElementById('lastName').value,
            title: 'Last Name',
            valid: false
        },
        contactNumber: {
            value: document.getElementById('contactNumber').value,
            title: 'Mobile Number',
            valid: false
        },
        emailId: {
            value: document.getElementById('emailId').value,
            title: 'Email ID',
            valid: false
        }
    };
    let validationObject = isFormValidForOtp(otpValidationForm);
    if (validationObject.valid && timeInMs === 0) {
        document.getElementById('otpTextCode').disabled = false;
    } else {
        document.getElementById('otpTextCode').disabled = true;
    }
}

function sendOtpRequestVerify(isPhone = true) {
    if (isPhone) {
        defaultOtpType = 'phone';
        document.getElementById('otpCode').maxLength = 4;
    } else {
        defaultOtpType = 'email';
        document.getElementById('otpCode').maxLength = 6;
    }
    document.getElementById('otpTextCode').disabled = true;
    document.getElementById('otpEmailCode').disabled = true;
    let form = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        contactNumber: document.getElementById('contactNumber').value,
        emailId: document.getElementById('emailId').value
    };
    makeRequest(
        'POST',
        SendOtpAnonymous,
        JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            emailId: form.emailId,
            contactNumber: form.contactNumber,
            newUser: 'new user',
            senderEmail: '',
            type: defaultOtpType,
            smsOtpCode: ''
        })
    )
        .then((res) => {
            clearFieldsErrorsMessages();
            clearMessagesFromServer('form-errors');
            if (JSON.parse(res.body).code === 7005) {
                document.getElementById('otpVerify').classList.remove('hide');
                document.getElementById('otpTextCode').disabled = true;
                resendInterval = setInterval(() => {
                    resendTimer();
                }, 1000);
            }
        })
        .catch((err) => {
            clearFieldsErrorsMessages();
            clearMessagesFromServer('form-errors');
            document.getElementById('otpTextCode').disabled = false;
            if (err.message === 'Email already exists.') {
                let error = document.createElement('div');
                error.classList.add('form-error');
                error.innerText = err.message;
                document
                    .getElementById('emailId')
                    .parentNode.appendChild(error);
            } else if (err.message === 'Contact number already exists.') {
                let error = document.createElement('div');
                error.classList.add('form-error');
                error.innerText = err.message;
                document
                    .getElementById('contactNumber')
                    .parentNode.appendChild(error);
            }
            console.log(err);
        });
}

function resendTimer() {
    if (timeInMs < 30000) {
        timeInMs += 1000;
        document.getElementById('otpTextCode').innerText = `Resend in:\n${
            (30000 - timeInMs) / 1000
        } sec.`.toUpperCase();
        document.getElementById('otpEmailCode').innerText = `Resend in:\n${
            (30000 - timeInMs) / 1000
        } sec.`.toUpperCase();
        document.getElementById('otpTextCode').disabled = true;
        document.getElementById('otpEmailCode').disabled = true;
    } else {
        clearInterval(resendInterval);
        document.getElementById('otpTextCode').innerText =
            'Text Code'.toUpperCase();
        document.getElementById('otpEmailCode').innerText =
            'Email Code'.toUpperCase();
        document.getElementById('otpTextCode').disabled = false;
        document.getElementById('otpEmailCode').disabled = false;
        document.getElementById('otpEmailCode').classList.remove('hide');
        timeInMs = 0;
    }
}

function verifyOtp() {
    let form = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        contactNumber: document.getElementById('contactNumber').value,
        emailId: document.getElementById('emailId').value,
        smsOtpCode: document.getElementById('otpCode').value
    };
    makeRequest(
        'POST',
        VerifyOtpUrl,
        JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            emailId: form.emailId,
            contactNumber: form.contactNumber,
            newUser: 'new user',
            senderEmail: '',
            type: defaultOtpType,
            smsOtpCode: form.smsOtpCode
        })
    )
        .then((res) => {
            clearInterval(resendInterval);
            document.getElementById('emailId').disabled = true;
            document.getElementById('contactNumber').disabled = true;
            document
                .getElementById('otpVerify')
                .parentNode.classList.add('hide');
            document.getElementById('otpTextCode').classList.remove('small');
            document.getElementById('otpTextCode').classList.add('verified');
            document.getElementById('otpEmailCode').classList.add('hide');
            document.getElementById('otpTextCode').disabled = true;
            isOtpVerified = true;
            document.getElementById('otpTextCode').innerText =
                'Verified'.toUpperCase();
        })
        .catch((err) => {
            let error = document.createElement('div');
            error.classList.add('form-error');
            error.innerText = err.message;
            document.getElementById('otpCode').parentNode.appendChild(error);
            console.log(err);
        });
}

function sendSmsReferralMessage() {
    document.getElementById('sendSmsStatus').innerText = '';
    isNumberValid = fieldValidation(
        document.getElementById('sendSmsNumber').value,
        US_PHONE_PATTERN
    );
    if (isNumberValid) {
        if (isAppleDevice()) {
            window.open(
                `sms:${document.getElementById('sendSmsNumber').value}&body=${
                    document.getElementById('copy').value
                }`
            );
        } else {
            window.open(
                `sms:${document.getElementById('sendSmsNumber').value}?body=${
                    document.getElementById('copy').value
                }`
            );
        }
    } else {
        document.getElementById('sendSmsStatus').style.color = '#F36';
        document.getElementById('sendSmsStatus').innerText =
            'Phone number is invalid';
    }
}

function showErrorMessageFromServer(response, formNumber) {
    response.then((body) => {
        let errorEl =
            document.getElementsByClassName('form-errors')[formNumber];
        if (errorEl) {
            errorEl.innerText = body[0].Message;
        }
    });
}

async function makeRequest(method, url, data) {
    const result = new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve({
                    headers: xhr.getAllResponseHeaders(),
                    body: xhr.response
                });
            } else {
                reject({
                    message: JSON.parse(this.response)[0].Message,
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                message: JSON.parse(this.response)[0].Message,
                status: this.status,
                statusText: xhr.statusText
            });
        };
        if (method === 'POST' && data) {
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.send(data);
        } else {
            xhr.send();
        }
    });
    return await result;
}

function setCookie(name, value, options = {}) {
    options = {
        path: '/',
        ...options
    };

    if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString();
    }

    let updatedCookie =
        encodeURIComponent(name) + '=' + encodeURIComponent(value);

    for (let optionKey in options) {
        updatedCookie += '; ' + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += '=' + optionValue;
        }
    }

    document.cookie = updatedCookie;
}
