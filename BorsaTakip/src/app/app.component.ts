import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  isDarkMode = false;
  isProfileVisible = false;
  isUyeOlVisible = false;

  name = '';
  email = '';
  username = '';
  password = '';

  isLoggedIn = false;
  loggedInUser = '';

  items: any[] = [];

  constructor(private http: HttpClient, private messageService: MessageService) {}

  ngOnInit(): void {
    if (localStorage.getItem('darkMode') === 'enabled') {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
    }

    this.items = [
      {
        label: 'LinkedIn',
        icon: 'pi pi-linkedin',
        command: () => this.shareOnLinkedIn(),
      },
      {
        label: 'Facebook',
        icon: 'pi pi-facebook',
        command: () => this.shareOnFacebook(),
      },
      {
        label: 'Twitter',
        icon: 'pi pi-twitter',
        command: () => this.shareOnTwitter(),
      },
      {
        label: 'WhatsApp',
        icon: 'pi pi-whatsapp',
        command: () => this.shareOnWhatsApp(),
      },
    ];
  }

  // Üye Olma
  registerUser() {
    const newUser = {
      full_name: this.name,
      email: this.email,
      username: this.username,
      password: this.password,
    };

    this.http.post('http://localhost:8000/register', newUser).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Kayıt Başarılı',
          detail: 'Üye kaydınız başarıyla oluşturuldu.',
        });
        this.isUyeOlVisible = false;
        this.clearFields();
      },
      error: err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: err.error.detail || 'Kayıt sırasında bir hata oluştu.',
        });
      },
    });
  }

  // Giriş
  loginUser() {
    const credentials = {
      username: this.username,
      password: this.password
    };
  
    this.http.post<any>('http://localhost:8000/login', credentials).subscribe({
      next: (res) => {
        this.loggedInUser = res.username;
        this.isLoggedIn = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Hoşgeldiniz',
          detail: `${this.loggedInUser} olarak giriş yaptınız.`
        });
        this.isProfileVisible = false;
        this.username = '';
        this.password = '';
      },
      error: (err) => {
        if (err.status === 401) {
          this.messageService.add({
            severity: 'error',
            summary: 'Giriş Başarısız',
            detail: 'Kullanıcı adı veya şifre hatalı.'
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Hata',
            detail: 'Sunucu hatası oluştu.'
          });
        }
      }
    });
  }
  

  logout = () => {
    this.isLoggedIn = false;
    this.loggedInUser = '';
    this.username = '';
    this.password = '';
    this.messageService.add({
      severity: 'info',
      summary: 'Çıkış Yapıldı',
      detail: 'Başarıyla çıkış yaptınız.'
    });
  };
  

  clearFields() {
    this.name = '';
    this.email = '';
    this.username = '';
    this.password = '';
  }

  ProfilDialog() {
    this.isProfileVisible = true;
  }

  closeDialog() {
    this.isProfileVisible = false;
  }

  openRegisterDialog() {
    this.isUyeOlVisible = true;
  }

  closeRegisterDialog() {
    this.isUyeOlVisible = false;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    const mode = this.isDarkMode ? 'enabled' : 'disabled';
    document.documentElement.classList.toggle('dark', this.isDarkMode);
    localStorage.setItem('darkMode', mode);
  }

  shareOnLinkedIn() {
    const url = window.location.href;
    const text = 'Beni takip et!';
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url
      )}&title=${encodeURIComponent(text)}`,
      '_blank'
    );
  }

  shareOnFacebook() {
    const url = window.location.href;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank'
    );
  }

  shareOnTwitter() {
    const url = window.location.href;
    const text = 'Beni takip et!';
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(text)}`,
      '_blank'
    );
  }

  shareOnWhatsApp() {
    const url = window.location.href;
    const text = 'Beni takip et!';
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(
        text
      )}%20${encodeURIComponent(url)}`,
      '_blank'
    );
  }
}
