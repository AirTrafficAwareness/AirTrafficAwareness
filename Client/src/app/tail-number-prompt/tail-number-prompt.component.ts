import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormControl, Validators} from '@angular/forms';

import faaNumbers from '../../assets/faaNumbers.json';

@Component({
  selector: 'app-tail-number-prompt',
  templateUrl: './tail-number-prompt.component.html',
  styleUrls: ['./tail-number-prompt.component.scss']
})
export class TailNumberPromptComponent implements OnInit {
  nNumber = new FormControl('');
  icoaNumber = new FormControl('', Validators.required);

  constructor(public dialogRef: MatDialogRef<TailNumberPromptComponent>) { }

  ngOnInit(): void {
  }

  cancel(): void {
    this.dialogRef.close();
  }

  lookup(control: HTMLInputElement): boolean {
    if (this.nNumber.value && this.nNumber.value.length > 2 && this.nNumber.value.toUpperCase().startsWith('N')) {
      const n = this.nNumber.value.substring(1).toUpperCase();
      let found = null;
      for (const [key, value] of Object.entries(faaNumbers)) {
        if (value === n) {
          found = key;
        }
      }
      if (!found) {
        alert('Not found!');
      } else {
        this.icoaNumber.setValue(found);
      }
    }
    control.blur();
    return false;
  }

  blur(control: HTMLInputElement) {
    console.log("BLURRR!!", control);
    control.blur();
    // ($event.target as HTMLElement).blur();
    // return false
  }
}
