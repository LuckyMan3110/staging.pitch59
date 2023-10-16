import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { AppSettings } from '../app.settings';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class StorageService {
  isBrowser;

  constructor(@Inject(PLATFORM_ID) private platformId) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  getUserId() {
    try {
      const userDetails = JSON.parse(
        this.getItem(AppSettings.USER_DETAILS)
      );
      if (userDetails) {
        return userDetails.userId;
      }
      return null;
    } catch (ex) {
      return null;
    }
  }

  getItem<T>(key: string, parse = false): T {
    if (this.isBrowser) {
      const result = localStorage.getItem(key);
      let resultJson = null;
      if (result != null) {
        resultJson = result;
      }

      if (parse) {
        try {
          resultJson = JSON.parse(resultJson);
        } catch (ex) {
        }
      }
      return resultJson;
    }
  }

  setItem<T>(key: string, value: T, stringify = true) {
    if (this.isBrowser) {
      localStorage.setItem(
        key,
        value && stringify ? JSON.stringify(value) : <any>value
      );
    }
  }

  setItemInCookies(key: string, value: string) {
    if (this.isBrowser) {
      const d = new Date();
      d.setTime(d.getTime() + AppSettings.COOKIE_EXPIRY);
      const expires = 'expires=' + d.toUTCString();
      document.cookie = key + '=' + value + ';' + expires + ';path=/';
    }
  }

  getItemFromCookies(key: string) {
    if (this.isBrowser) {
      const name = key + '=';
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
          return c.substring(name.length, c.length);
        }
      }
      return '';
    }
  }

  removeItem<T>(key: string) {
    if (this.isBrowser) {
      localStorage.removeItem(key);
    }
  }

  removeAll<T>() {
    if (this.isBrowser) {
      localStorage.clear();
    }
  }

  /* removeAllCookies() {
  const that = this;
  this.cookiesItems.forEach(key => {
    that.setItemInCookies(key, '');
  });
} */

  removeAllCookies() {
    if (this.isBrowser) {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie =
          name +
          '=;expires=Thu, 01 Jan 1970 00:00:00 GMT' +
          ';path=/';
      }
    }
  }

  getSession<T>(key: string) {
    if (this.isBrowser) {
      const result = sessionStorage.getItem(key);
      let resultJson = null;
      if (result != null) {
        resultJson = JSON.parse(result);
      }
      return resultJson;
    }
  }

  setSession<T>(key: string, value: T) {
    if (this.isBrowser) {
      sessionStorage.setItem(key, JSON.stringify(value));
    }
  }

  removeSession<T>(key: string) {
    if (this.isBrowser) {
      sessionStorage.removeItem(key);
    }
  }

  removeAllSessions<T>() {
    if (this.isBrowser) {
      sessionStorage.clear();
    }
  }
}
