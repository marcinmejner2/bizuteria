import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { JewelryCategoryComponent } from './components/jewelry/jewelry-category/jewelry-category.component';
import { LoginComponent } from './components/auth/login/login.component';
import { AdminPanelComponent } from './components/admin/admin-panel/admin-panel.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'naramek', component: JewelryCategoryComponent, data: { category: 'naramek' } },
  { path: 'privesek', component: JewelryCategoryComponent, data: { category: 'privesek' } },
  { path: 'krouzek', component: JewelryCategoryComponent, data: { category: 'krouzek' } },
  { path: 'naramekNaKotnik', component: JewelryCategoryComponent, data: { category: 'naramekNaKotnik' } },
  { path: 'klicenka', component: JewelryCategoryComponent, data: { category: 'klicenka' } },
  { path: 'nausnice', component: JewelryCategoryComponent, data: { category: 'nausnice' } },
  { path: 'sadaSperku', component: JewelryCategoryComponent, data: { category: 'sadaSperku' } },
  { path: 'mobil', component: JewelryCategoryComponent, data: { category: 'mobil' } },
  { path: 'ostatni', component: JewelryCategoryComponent, data: { category: 'ostatni' } },

  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminPanelComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'privesek' } // Przekierowanie do strony głównej, jeśli ścieżka nie istnieje
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
