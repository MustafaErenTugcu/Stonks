import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {OverlayPanel} from "primeng/overlaypanel";
import {color} from "chart.js/helpers";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isDarkMode: boolean = false;
  isProfileVisible = false;
  protected items: any[];

  ProfilDialog() {
    this.isProfileVisible = true;
  }
  closeDialog(){
    this.isProfileVisible = false;
  }

  protected readonly close = close;
 isUyeOlVisible = false
  openRegisterDialog() {
   this.isUyeOlVisible = true;
 }

  closeRegisterDialog() {
    this.isUyeOlVisible = false;
  }
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      document.documentElement.classList.add('dark'); // Dark mode aç
      localStorage.setItem('darkMode', 'enabled'); // Dark mode'u kaydet
    } else {
      document.documentElement.classList.remove('dark'); // Dark mode kapat
      localStorage.setItem('darkMode', 'disabled'); // Kayıtlı dark mode'u temizle
    }
  }

  ngOnInit() {
    // Sayfa yenilendiğinde dark mode'u kontrol et
    if (localStorage.getItem('darkMode') === 'enabled') {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
    }
    this.items = [
      {
        label: 'LinkedIn',
        icon: 'pi pi-linkedin',
        class: 'linkedin-bg',
        command: () => this.shareOnLinkedIn()
      },
      {
        label: 'Facebook',
        icon: 'pi pi-facebook',
        class: 'facebook-bg',
        command: () => this.shareOnFacebook()
      },
      {
        label: 'Twitter',
        icon: 'pi pi-twitter',
        class: 'twitter-bg',
        command: () => this.shareOnTwitter()
      },
      {
        label: 'WhatsApp',
        icon: 'pi pi-whatsapp',
        class: 'whatsapp-bg',
        command: () => this.shareOnWhatsApp()
      }
    ];
  }

  shareOnLinkedIn() {
    const url = window.location.href;
    const text = 'Beni takip et!';
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  }

  shareOnFacebook() {
    const url = window.location.href;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
  }

  shareOnTwitter() {
    const url = window.location.href;
    const text = 'Beni takip et!';
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  }

  shareOnWhatsApp() {
    const url = window.location.href;
    const text = 'Beni takip et!';
    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}%20${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');

 }

}
