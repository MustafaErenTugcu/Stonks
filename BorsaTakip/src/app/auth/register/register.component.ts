import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  displayRegister: boolean = true;

  name: string = '';
  email: string = '';
  username: string = '';
  password: string = '';

  constructor(private http: HttpClient) {}

  register() {
    if (this.name && this.email && this.username && this.password) {
      const user = {
        name: this.name,
        email: this.email,
        username: this.username,
        password: this.password
      };

      this.http.post('http://localhost:8000/register', user).subscribe({
        next: (response) => {
          console.log('Kayıt başarılı', response);
          this.displayRegister = false;
        },
        error: (error) => {
          console.error('Kayıt başarısız', error);
        }
      });
    } else {
      alert('Lütfen tüm alanları doldurun.');
    }
  }

  closeDialog() {
    this.displayRegister = false;
  }
}
