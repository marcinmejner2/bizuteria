import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { NecklacesComponent } from './components/jewelry/necklaces/necklaces.component';
import { BraceletsComponent } from './components/jewelry/bracelets/bracelets.component';
import { RingsComponent } from './components/jewelry/rings/rings.component';
import { EarringsComponent } from './components/jewelry/earrings/earrings.component';
import { LoginComponent } from './components/auth/login/login.component';
import { AdminPanelComponent } from './components/admin/admin-panel/admin-panel.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'necklaces', component: NecklacesComponent },
  { path: 'bracelets', component: BraceletsComponent },
  { path: 'rings', component: RingsComponent },
  { path: 'earrings', component: EarringsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminPanelComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' } // Przekierowanie do strony głównej, jeśli ścieżka nie istnieje
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
