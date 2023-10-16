// dragula.module.ts
import { NgModule } from '@angular/core';
import { DragulaDirective } from './dragula.directive';
import { DragulaService } from './dragula.service';

@NgModule({
    declarations: [DragulaDirective],
    exports: [DragulaDirective],
    providers: [DragulaService]
})
class DragulaModule {
    static forRoot(): any {
      return {
        ngModule: DragulaModule
      };
    }
}

export { DragulaDirective, DragulaModule, DragulaService };
