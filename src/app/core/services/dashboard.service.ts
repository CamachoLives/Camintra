import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  ResumenIntranet,
  IndicadoresIntranet,
} from '../models/intranet.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = inject(ApiService);

  /** Toda la portada en una sola llamada */
  resumen(): Observable<ResumenIntranet> {
    return this.api.get<ResumenIntranet>('/dashboard');
  }

  indicadores(): Observable<IndicadoresIntranet> {
    return this.api.get<IndicadoresIntranet>('/dashboard/indicadores');
  }
}
