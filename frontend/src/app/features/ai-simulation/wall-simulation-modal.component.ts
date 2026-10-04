import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AiService } from '../../core/services/ai.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ProductDetail } from '../../core/models/product.models';
import { SimulationQuotaResponse, SimulationResponse } from '../../core/models/ai.models';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-wall-simulation-modal',
  standalone: true,
  imports: [CommonModule, RouterLink, ImageUrlPipe],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      
      <div class="bg-[#12100d] border border-aurora-gold/40 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)] animate-scaleUp">
        
        <!-- Header -->
        <div class="p-6 border-b border-aurora-border/80 bg-aurora-darker flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-aurora-gold/10 border border-aurora-gold/30 text-aurora-gold flex items-center justify-center text-lg shadow-inner">
              ✨
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono uppercase tracking-widest text-aurora-gold">Spatial AI Preview</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-aurora-gold/15 text-aurora-gold font-mono border border-aurora-gold/30">
                  Virtual Wall Atelier
                </span>
              </div>
              <h2 class="font-serif text-lg sm:text-xl font-bold text-white tracking-tight">
                Simulate <span class="text-aurora-gold italic font-normal">"{{ product.name }}"</span> on Your Wall
              </h2>
            </div>
          </div>

          <button 
            (click)="close.emit()" 
            class="w-8 h-8 rounded-full bg-aurora-card border border-aurora-border hover:border-aurora-gold text-aurora-sand/70 hover:text-white flex items-center justify-center transition-colors">
            ✕
          </button>
        </div>

        <!-- Body Area -->
        <div class="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-xs">
          
          <!-- Not Signed In Prompt -->
          <div *ngIf="!authService.currentUser()" class="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="space-y-1 text-left">
              <h4 class="font-serif font-bold text-white text-sm">Collector Sign-In Required</h4>
              <p class="text-aurora-sand/80 text-xs">
                To prevent automated API exploitation and maintain zero operational costs, registered collectors receive <strong>3 free AI wall simulations</strong> each month.
              </p>
            </div>
            <a routerLink="/auth" class="px-5 py-2.5 rounded-xl bg-aurora-gold text-aurora-darker font-bold uppercase tracking-wider text-xs whitespace-nowrap shadow-lg hover:bg-aurora-goldLight transition-colors">
              Sign In to Simulate
            </a>
          </div>

          <!-- Signed In Quota Tracker -->
          <div *ngIf="authService.currentUser()" class="p-4 rounded-2xl bg-aurora-darker border border-aurora-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span class="text-xl">📊</span>
              <div>
                <span class="text-[10px] font-mono uppercase text-aurora-sand/50 block">Monthly Rate-Limited Quota</span>
                <span class="font-medium text-white">
                  <strong class="text-aurora-gold">{{ quota?.remainingQuota ?? 3 }}</strong> of {{ quota?.monthlyQuota ?? 3 }} simulations remaining this calendar month
                </span>
              </div>
            </div>

            <!-- Dots representation -->
            <div class="flex items-center gap-1.5">
              <div 
                *ngFor="let i of [0, 1, 2]" 
                class="w-3.5 h-3.5 rounded-full border transition-all"
                [ngClass]="i < (quota?.remainingQuota ?? 3) ? 'bg-aurora-gold border-aurora-gold shadow-[0_0_8px_rgba(212,175,55,0.6)]' : 'bg-aurora-darker border-zinc-700'">
              </div>
            </div>
          </div>

          <!-- Product Details Mini Ribbon -->
          <div class="p-3.5 rounded-2xl bg-aurora-card/60 border border-aurora-border/60 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <img 
                [src]="product | imageUrl" 
                [alt]="product.name" 
                class="w-12 h-14 object-cover rounded-xl border border-aurora-border" />
              <div>
                <div class="font-serif font-bold text-white text-xs">{{ product.name }}</div>
                <div class="text-aurora-sand/60 text-[11px]">{{ product.woodType }} • Handcrafted in Kairouan</div>
              </div>
            </div>
            <div class="text-right">
              <span class="text-[10px] font-mono text-aurora-sand/50 block uppercase">Dimensions</span>
              <span class="text-aurora-gold font-mono text-xs">{{ product.dimensions || 'Approx. 45 x 22 cm' }}</span>
            </div>
          </div>

          <!-- Upload Dropzone (When No Simulation Result Yet) -->
          <div *ngIf="!simulationResult" class="space-y-4">
            
            <div 
              (dragover)="onDragOver($event)" 
              (dragleave)="onDragLeave($event)" 
              (drop)="onDrop($event)"
              (click)="fileInput.click()"
              class="border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 relative group"
              [ngClass]="isDragging ? 'border-aurora-gold bg-aurora-gold/10' : 'border-aurora-border hover:border-aurora-gold/60 bg-aurora-darker/60'">
              
              <input 
                #fileInput 
                type="file" 
                accept="image/jpeg,image/png,image/webp" 
                (change)="onFileSelected($event)" 
                class="hidden" />

              <!-- Preview of Selected Wall Image -->
              <div *ngIf="selectedFilePreview" class="space-y-3">
                <img 
                  [src]="selectedFilePreview" 
                  alt="Customer wall photo preview" 
                  class="max-h-56 mx-auto rounded-2xl object-cover border border-aurora-gold/50 shadow-xl" />
                <p class="text-xs text-aurora-sand/80">
                  Click or drag another image to change your wall photo
                </p>
                <div class="font-mono text-[11px] text-aurora-gold">
                  Ready to simulate lighting and wall depth
                </div>
              </div>

              <!-- Default Empty Prompt -->
              <div *ngIf="!selectedFilePreview" class="space-y-3">
                <div class="w-16 h-16 rounded-full bg-aurora-card border border-aurora-border group-hover:border-aurora-gold/60 flex items-center justify-center mx-auto text-2xl transition-transform group-hover:scale-110">
                  📸
                </div>
                <div>
                  <p class="font-serif text-base font-bold text-white">
                    Upload a Photo of Your Living Room or Gallery Wall
                  </p>
                  <p class="text-xs text-aurora-sand/60 mt-1 max-w-md mx-auto">
                    Take a picture in natural or ambient light. Our multimodal AI engine will composite the wooden mask with authentic depth, shadows, and architectural perspective.
                  </p>
                </div>
                <div class="inline-block px-4 py-2 rounded-xl bg-aurora-card border border-aurora-border text-aurora-sand font-mono text-[11px]">
                  JPEG, PNG, or WebP up to 10MB
                </div>
              </div>

            </div>

            <!-- Error Banner -->
            <div *ngIf="errorMessage" class="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
              {{ errorMessage }}
            </div>

            <!-- Action: Execute Simulation -->
            <button 
              *ngIf="selectedFile && authService.currentUser()"
              (click)="runSimulation()" 
              [disabled]="loading || (quota && quota.remainingQuota <= 0)"
              class="w-full py-4 rounded-2xl bg-gradient-to-r from-aurora-gold via-amber-400 to-aurora-goldLight text-aurora-darker font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
              <span *ngIf="!loading">Generate AI Wall Preview</span>
              <span *ngIf="loading">{{ loadingStepText }}</span>
              <div *ngIf="loading" class="w-4 h-4 border-2 border-aurora-darker border-t-transparent rounded-full animate-spin"></div>
            </button>

            <div *ngIf="quota && quota.remainingQuota <= 0" class="text-center text-xs text-amber-400 font-mono">
              ⚠️ You have used all 3 free simulations for this month. Quota resets on {{ quota.resetsAt | date:'mediumDate' }}.
            </div>
          </div>

          <!-- Simulation Result Display (When AI Result Returned) -->
          <div *ngIf="simulationResult" class="space-y-6 animate-fadeIn">
            
            <div class="relative rounded-3xl overflow-hidden border border-aurora-gold/50 shadow-2xl bg-black">
              <!-- Rendered Composite Preview -->
              <img 
                [src]="activeView === 'composite' ? simulationResult.resultImageUrl : selectedFilePreview" 
                alt="AI simulated mask on customer wall" 
                class="w-full max-h-[460px] object-contain mx-auto" />

              <!-- Overlay Watermark Tag -->
              <div class="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-aurora-gold/40 text-[10px] font-mono text-aurora-gold flex items-center gap-2">
                <span>✨ Aurora Virtual Atelier</span>
                <span>•</span>
                <span>{{ simulationResult.woodType }}</span>
              </div>

              <!-- View Switcher -->
              <div class="absolute top-4 right-4 flex items-center gap-1.5 p-1 rounded-xl bg-black/70 backdrop-blur-md border border-aurora-border">
                <button 
                  (click)="activeView = 'composite'"
                  class="px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all"
                  [ngClass]="activeView === 'composite' ? 'bg-aurora-gold text-aurora-darker' : 'text-aurora-sand hover:text-white'">
                  AI Simulated Wall
                </button>
                <button 
                  (click)="activeView = 'original'"
                  class="px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all"
                  [ngClass]="activeView === 'original' ? 'bg-aurora-gold text-aurora-darker' : 'text-aurora-sand hover:text-white'">
                  Original Wall Photo
                </button>
              </div>
            </div>

            <!-- Result Actions -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a 
                [href]="simulationResult.resultImageUrl" 
                download="aurora-wall-simulation.png"
                target="_blank"
                class="py-3 px-4 rounded-xl bg-aurora-card hover:bg-aurora-cardHover border border-aurora-border text-center font-bold text-aurora-sand hover:text-white text-xs transition-colors flex items-center justify-center gap-2">
                <span>⬇️</span>
                <span>Save Wall Mockup</span>
              </a>

              <button 
                (click)="resetSimulation()"
                class="py-3 px-4 rounded-xl bg-aurora-card hover:bg-aurora-cardHover border border-aurora-border text-center font-bold text-aurora-sand hover:text-white text-xs transition-colors">
                Try Another Wall Photo
              </button>

              <button 
                (click)="addToCartAndClose()"
                class="py-3 px-4 rounded-xl bg-aurora-gold text-aurora-darker font-bold uppercase tracking-wider text-xs hover:bg-aurora-goldLight transition-colors shadow-lg shadow-aurora-gold/20 flex items-center justify-center gap-2">
                <span>Acquire This Mask</span>
                <span>→</span>
              </button>
            </div>

          </div>

        </div>

        <!-- Footer -->
        <div class="p-4 sm:p-5 border-t border-aurora-border/80 bg-aurora-darker flex items-center justify-between text-[11px] text-aurora-sand/60">
          <div class="flex items-center gap-2">
            <span>🛡️ Multimodal AI Geometry</span>
            <span>•</span>
            <span>Rate-limited to 3/month per collector</span>
          </div>

          <button (click)="close.emit()" class="hover:text-white text-xs font-semibold">
            Close Preview
          </button>
        </div>

      </div>

    </div>
  `
})
export class WallSimulationModalComponent implements OnInit {
  @Input({ required: true }) product!: ProductDetail;
  @Output() close = new EventEmitter<void>();

  private readonly aiService = inject(AiService);
  readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);

  quota: SimulationQuotaResponse | null = null;
  selectedFile: File | null = null;
  selectedFilePreview: string | null = null;
  isDragging = false;
  loading = false;
  loadingStepText = 'Analyzing Wall Geometry & Lighting...';
  errorMessage = '';

  simulationResult: SimulationResponse | null = null;
  activeView: 'composite' | 'original' = 'composite';

  ngOnInit(): void {
    if (this.authService.currentUser()) {
      this.fetchQuota();
    }
  }

  fetchQuota(): void {
    this.aiService.getQuota().subscribe({
      next: (res) => {
        this.quota = res.data;
      },
      error: () => {}
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  private handleFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select a valid image file (JPEG, PNG, or WebP).';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage = 'Image size must be under 10MB.';
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';

    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedFilePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  runSimulation(): void {
    if (!this.selectedFile) return;
    this.loading = true;
    this.errorMessage = '';
    this.loadingStepText = 'Uploading wall photograph...';

    // Simulated progress steps for premium UX
    setTimeout(() => {
      if (this.loading) this.loadingStepText = 'Analyzing spatial geometry & ambient lighting...';
    }, 900);
    setTimeout(() => {
      if (this.loading) this.loadingStepText = 'Rendering authentic wood grain & specular reflections...';
    }, 2000);
    setTimeout(() => {
      if (this.loading) this.loadingStepText = 'Compositing mask with natural ambient drop-shadow...';
    }, 3200);

    this.aiService.simulateWall(this.product.id, this.selectedFile).subscribe({
      next: (res) => {
        this.loading = false;
        this.simulationResult = res.data;
        if (this.quota) {
          this.quota.usedThisMonth = res.data.usedThisMonth;
          this.quota.remainingQuota = res.data.remainingQuota;
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to simulate mask on wall. Please try another image.';
      }
    });
  }

  resetSimulation(): void {
    this.simulationResult = null;
    this.selectedFile = null;
    this.selectedFilePreview = null;
    this.activeView = 'composite';
  }

  addToCartAndClose(): void {
    this.cartService.addToCart(this.product, 1);
    this.close.emit();
  }
}
