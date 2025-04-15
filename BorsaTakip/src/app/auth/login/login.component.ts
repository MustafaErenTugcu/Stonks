import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private http: HttpClient) {}

  login() {
    const body = { username: this.username, password: this.password };
    this.http.post<any>('http://localhost:8000/login', body).subscribe({
      next: (res) => {
        localStorage.setItem('loggedInUser', res.username);
        alert('Giriş başarılı!');
        window.location.reload();
      },
      error: () => alert('Giriş başarısız.')
    });
  }
  closeDialog() {
    // Eğer modal p-dialog ile açılıyorsa onun görünürlüğünü kontrol et
    // Örnek: this.dialogVisible = false;
    window.history.back(); // Veya başka uygun bir sayfaya yönlendirme
  }
}
