import { Injectable } from '@angular/core';
import { RestApiService } from '../../shared/services/rest-api.service';
import { Observable } from 'rxjs';

interface NewPocketParams {
    name: string;
    color: number;
}

interface PocketsIdsParams {
    pocketIds: number[];
}

interface ContentIdsParams {
    contentIds: number[];
}

interface UpdatePocketparams {
    id: number;
    name?: string;
    color?: number;
}

@Injectable()
export class MyPocketsService {
    constructor(private restApiService: RestApiService) {
    }

    private myPocketsColor: string[] = [
        '#ac3931',
        '#ffa401',
        '#133d55',
        '#131b40',
        '#f1dc5d',
        '#25aeb4',
        '#3e000d',
        '#cb2936'
    ];

    getPocketGradients() {
        return [
          {
            mainColor: '#ac3931',
            gradient: 'linear-gradient(180deg, #AC3931 0%, #FFFCFC 356.83%)'
          },
          {
            mainColor: '#ffa401',
            gradient: 'linear-gradient(180deg, #FFA401 0%, #FFFEFB 189.13%)'
          },
          {
            mainColor: '#133d55',
            gradient:
              'linear-gradient(179.17deg, #133D55 0.71%, #FBFEFF 625.79%)'
          },
          {
            mainColor: '#131b40',
            gradient: 'linear-gradient(180deg, #131B40 0%, #FEFDFF 677.95%)'
          },
          {
            mainColor: '#f1dc5d',
            gradient: 'linear-gradient(180deg, #F1DC5D 0%, #FFFFFC 186.65%)'
          },
          {
            mainColor: '#25aeb4',
            gradient:
              'linear-gradient(180deg, #25AEB4 0%, #25AEB4FF 215.53%)'
          },
          {
            mainColor: '#3e000d',
            gradient: 'linear-gradient(180deg, #3E000D 0%, #FFFEFE 338.35%)'
          },
          {
            mainColor: '#cb2936',
            gradient: 'linear-gradient(180deg, #CB2936 0%, #FFFEFE 343.63%)'
          }
        ];
    }

  getMyPocketsColor(): string[] {
    return [...this.myPocketsColor];
  }

  getAllPockets(
    searchText?,
    onlyMy: boolean = false,
    draft: boolean = true
  ): Observable<any> {
    const params = this.restApiService.convertObjToQueryParams({
      limit: 25,
      name: searchText ? searchText : '',
      onlyMy: onlyMy,
      draft: draft
    });
    return this.restApiService.get('get-pockets', `pocket?${params}`);
  }

  getPocketContent(
    pocketId: number,
    draft: boolean = true,
    searchText?: string
  ): Observable<any> {
    const params = this.restApiService.convertObjToQueryParams({
      draft: draft,
      name: searchText
    });
    return this.restApiService.get(
      'get-pocket-content',
      `pocket/${pocketId}/get-content?${params}`
    );
  }

    getInvitePocketContent(inviteId: number): Observable<any> {
      return this.restApiService.get(
        'get-invite-pocket-content',
        `pocket/invite/${inviteId}/content`
      );
    }

    getPocketContentByToken(token: string): Observable<any> {
      return this.restApiService.get(
        'get-pocket-content-by-token',
        `pocket/${token}/get-pocket-by-key`
      );
    }

    createNewPocket(params: NewPocketParams): Observable<any> {
        return this.restApiService.post('add-pockets', 'pocket', params);
    }

    updatePocket(params: UpdatePocketparams): Observable<any> {
      return this.restApiService.post(
        'update-pocket',
        'pocket/update',
        params
      );
    }

    removePockets(params: PocketsIdsParams): Observable<any> {
      return this.restApiService.post(
        'remove-pockets',
        'pocket/delete',
        params
      );
    }

  addBusinessToPocket(businessId, pocketId): Observable<any> {
    return this.restApiService.get(
      'add-business-to-pocket',
      `pocket/${businessId}/save-card?pocket_id=${pocketId}`
    );
  }

  moveBusinessToPocket(
    fromId: number,
    businessId: string,
    toId: number
  ): Observable<any> {
    return this.restApiService.post(
      'move-business-to-pocket',
      `pocket/${fromId}/move-content/${toId}?businessId=${businessId}`,
      null
    );
  }

  removeBusinessFromPocket(
    fromPocketId: number,
    contentId: number
  ): Observable<any> {
    const params = {
      contentIds: [contentId]
    };

    return this.restApiService.post(
      'remove-business-from-pocket',
      `pocket/${fromPocketId}/delete-content`,
      params
    );
  }

    getEncryptedPocketId(pocketId: number): Observable<any> {
      return this.restApiService.get(
        'get-pocket-token',
        `pocket/${pocketId}/token`
      );
    }

  reorderPockets(params: PocketsIdsParams): Observable<any> {
    return this.restApiService.put(
      'reorder-pockets',
      'pocket/reorder-pockets',
      params
    );
  }

  reorderPitchCards(
    params: ContentIdsParams,
    pocketId: number
  ): Observable<any> {
    return this.restApiService.put(
      'reorder-content',
      `pocket/${pocketId}/reorder-content`,
      params
    );
  }

  copyPocketByToken(token): Observable<any> {
    return this.restApiService.get(
      'copy-pocket',
      `pocket/copy-pocket/${token}`
    );
  }
}
