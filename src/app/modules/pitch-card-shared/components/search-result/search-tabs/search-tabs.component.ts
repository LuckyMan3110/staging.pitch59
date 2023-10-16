import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SearchService, SearchTypes } from '../search.service';

@Component({
  selector: 'app-search-tabs',
  templateUrl: './search-tabs.component.html',
  styleUrls: ['./search-tabs.component.scss']
})
export class SearchTabsComponent implements OnInit {
  searchTabs = [
    {
      title: 'Services',
      searchType: SearchTypes.Businesses,
      query: ['basic', 'employee'],
      active: false,
      color: '#25AFB5'
    },
    {
      title: 'Resumes',
      searchType: SearchTypes.Resumes,
      query: ['resume'],
      active: false,
      color: '#D52C2C'
    },
    {
      title: 'Jobs',
      searchType: SearchTypes.Jobs,
      query: ['job'],
      active: false,
      color: '#28B256'
    },
    {
      title: 'Nonprofit',
      searchType: SearchTypes.Nonprofit,
      query: ['nonprofit'],
      active: false,
      color: '#E8AD01'
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private searchService: SearchService
  ) {
  }

  ngOnInit(): void {
    this.detectActiveSearch(this.searchService.getSearchType());
    this.onRouteChange();
    if (!this.route.snapshot.queryParams) {
      this.changeSearchType(this.searchTabs[0], 0);
    }
  }

  changeSearchType(tab, index) {
    console.log(tab);
    this.searchTabs.map((t) => (t.active = false));
    this.searchTabs[index].active = true;
    this.router.navigate(['/' + this.route.snapshot.url[0].path], {
      queryParams: {
        types: tab.query.join('.')
      }
    });
  }

  onRouteChange() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.detectActiveSearch(this.searchService.getSearchType());
      });
  }

  detectActiveSearch(searchType) {
    this.searchTabs.map((item) => {
      item.active = item.searchType === searchType;
    });
  }
}
