import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WikiRoutingModule } from './wiki-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, WikiRoutingModule],
})
export class WikiModule {}
