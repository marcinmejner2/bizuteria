import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { JewelryCategoryComponent } from './components/jewelry/jewelry-category/jewelry-category.component';
import { LoginComponent } from './components/auth/login/login.component';
import { AdminPanelComponent } from './components/admin/admin-panel/admin-panel.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'naramek', component: JewelryCategoryComponent, data: { category: 'naramek' } },
  { path: 'privesek', component: JewelryCategoryComponent, data: { category: 'privesek' } },
  { path: 'rings', component: JewelryCategoryComponent, data: { category: 'rings' } },
  { path: 'earrings', component: JewelryCategoryComponent, data: { category: 'earrings' } },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminPanelComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' } // Przekierowanie do strony głównej, jeśli ścieżka nie istnieje
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
