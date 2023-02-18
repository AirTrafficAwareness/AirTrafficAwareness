// import {Capacitor} from '@capacitor/core';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeComponent} from './home/home.component';
import {ListComponent} from './list/list.component';
import {DetailsComponent} from './details/details.component';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatToolbarModule} from '@angular/material/toolbar';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FontFitSizeDirective} from './font-fit-size.directive';
import {TailNumberPromptComponent} from './tail-number-prompt/tail-number-prompt.component';
import {IKeyboardLayouts, KeyboardClassKey, MAT_KEYBOARD_LAYOUTS, MatKeyboardModule} from 'angular-onscreen-material-keyboard';

const customLayouts: IKeyboardLayouts = {
  'Custom': {
    'name': 'Custom',
    'keys': [
      [
        ['1', '1'],
        ['2', '2'],
        ['3', '3'],
        ['4', '4'],
        ['5', '5'],
        ['6', '6'],
        ['7', '7'],
        ['8', '8'],
        ['9', '9'],
        ['0', '0'],
        [KeyboardClassKey.Bksp, KeyboardClassKey.Bksp, KeyboardClassKey.Bksp, KeyboardClassKey.Bksp]
      ],
      [
        ['Q', 'Q'],
        ['W', 'W'],
        ['E', 'E'],
        ['R', 'R'],
        ['T', 'T'],
        ['Y', 'Y'],
        ['U', 'U'],
        ['I', 'I'],
        ['O', 'O'],
        ['P', 'P'],
      ],
      [
        ['A', 'A'],
        ['S', 'S'],
        ['D', 'D'],
        ['F', 'F'],
        ['G', 'G'],
        ['H', 'H'],
        ['J', 'J'],
        ['K', 'K'],
        ['L', 'L'],
      ],
      [
        ['Z', 'Z'],
        ['X', 'X'],
        ['C', 'C'],
        ['V', 'V'],
        ['B', 'B'],
        ['N', 'N'],
        ['M', 'M'],
        [KeyboardClassKey.Enter, KeyboardClassKey.Enter, KeyboardClassKey.Enter, KeyboardClassKey.Enter]
      ]
    ],
    'lang': ['en-US']
  }
};


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ListComponent,
    DetailsComponent,
    FontFitSizeDirective,
    TailNumberPromptComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatToolbarModule,
    ReactiveFormsModule,
    MatKeyboardModule
  ],
  providers: [
    { provide: MAT_KEYBOARD_LAYOUTS, useValue: customLayouts }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
