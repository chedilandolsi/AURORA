import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ProductService } from '../../../core/services/product.service';
import { Category, ProductDetail } from '../../../core/models/product.models';
import { CreateProductPayload } from '../../../core/models/admin.models';
import { ImageUrlPipe } from '../../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ImageUrlPipe],
  template: `
    <div class="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto">
      
      <!-- Top Title & Action Button -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-aurora-border/60">
        <div>
          <span class="text-[11px] font-mono uppercase tracking-widest text-aurora-gold">Catalog Operations</span>
          <h1 class="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Artisanal Mask Inventory (CRUD)
          </h1>
          <p class="text-xs text-aurora-sand/60 mt-1">Create, update, adjust stock levels, or permanently delete masterworks.</p>
        </div>

        <button 
          (click)="openCreateModal()" 
          class="px-5 py-3 rounded-xl bg-gradient-to-r from-aurora-gold to-aurora-goldLight text-aurora-darker font-bold text-xs uppercase tracking-wider hover:brightness-105 transition-all shadow-lg shadow-aurora-gold/20 flex items-center gap-2 self-start sm:self-auto">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Catalog New Mask</span>
        </button>
      </div>

      <!-- Feedback Banner -->
      <div *ngIf="feedbackMessage" class="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg animate-fadeIn">
        <span class="flex items-center gap-2 font-medium">
          <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          {{ feedbackMessage }}
        </span>
        <button (click)="feedbackMessage = ''" class="text-emerald-400 hover:text-white text-xs">✕</button>
      </div>

      <!-- Search Toolbar -->
      <div class="bg-aurora-card border border-aurora-border rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xl">
        <div class="relative w-full sm:w-96">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (keyup.enter)="loadProducts()"
            placeholder="Search mask name, olive wood, cedar..." 
            class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-aurora-sand/40 focus:outline-none focus:border-aurora-gold" />
          <button (click)="loadProducts()" class="absolute right-3 top-2.5 text-aurora-sand/50 hover:text-aurora-gold">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        <div class="text-xs text-aurora-sand/60">
          Showing <strong class="text-white">{{ products.length }}</strong> masks in atelier
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="py-24 text-center">
        <div class="w-10 h-10 border-2 border-aurora-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-xs text-aurora-sand/60">Loading atelier catalog records...</p>
      </div>

      <!-- Products Data Table -->
      <div *ngIf="!loading" class="bg-aurora-card border border-aurora-border rounded-2xl overflow-hidden shadow-2xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-aurora-sand/80">
            <thead class="text-[10px] uppercase tracking-wider text-aurora-sand/50 bg-aurora-darker border-b border-aurora-border">
              <tr>
                <th class="py-3 px-4">Mask</th>
                <th class="py-3 px-4">Lineage / Category</th>
                <th class="py-3 px-4">Wood &amp; Dimensions</th>
                <th class="py-3 px-4 text-right">EUR / USD Price</th>
                <th class="py-3 px-4 text-center">Stock</th>
                <th class="py-3 px-4 text-center">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-aurora-border/40">
              <tr *ngFor="let product of products" class="hover:bg-aurora-darker/50 transition-colors">
                
                <!-- Mask Image & Name -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-3">
                    <img [src]="product.primaryImageUrl | imageUrl" [alt]="product.name" class="w-12 h-14 object-cover rounded-lg border border-aurora-border flex-shrink-0" />
                    <div>
                      <p class="font-serif font-bold text-white text-sm hover:text-aurora-gold transition-colors">{{ product.name }}</p>
                      <p class="text-[10px] text-aurora-sand/40 font-mono">ID: {{ product.id.substring(0, 8) }}...</p>
                    </div>
                  </div>
                </td>

                <!-- Category -->
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-aurora-darker border border-aurora-gold/30 text-aurora-gold">
                    {{ product.categoryName }}
                  </span>
                </td>

                <!-- Wood & Dimensions -->
                <td class="py-3.5 px-4 space-y-0.5">
                  <p class="text-white font-medium">{{ product.woodType }}</p>
                  <p class="text-[11px] text-aurora-sand/50 font-mono">{{ product.dimensions }}</p>
                </td>

                <!-- Pricing -->
                <td class="py-3.5 px-4 text-right space-y-0.5">
                  <p class="font-mono font-bold text-white">€{{ product.priceEur.toFixed(2) }}</p>
                  <p class="font-mono text-[11px] text-aurora-sand/50">\${{ product.priceUsd.toFixed(2) }}</p>
                </td>

                <!-- Stock Counter & Quick Adjust -->
                <td class="py-3.5 px-4 text-center">
                  <div class="inline-flex items-center border border-aurora-border rounded-lg bg-aurora-darker">
                    <button 
                      (click)="adjustStock(product, -1)" 
                      [disabled]="product.stockQuantity <= 0"
                      class="px-2 py-0.5 text-xs text-aurora-sand/60 hover:text-white disabled:opacity-30">
                      -
                    </button>
                    <span class="px-2.5 py-0.5 font-mono font-bold text-xs" [class.text-amber-400]="product.stockQuantity <= 3" [class.text-white]="product.stockQuantity > 3">
                      {{ product.stockQuantity }}
                    </span>
                    <button 
                      (click)="adjustStock(product, 1)" 
                      class="px-2 py-0.5 text-xs text-aurora-sand/60 hover:text-white">
                      +
                    </button>
                  </div>
                </td>

                <!-- Status Badge -->
                <td class="py-3.5 px-4 text-center">
                  <span 
                    class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                    [class.bg-emerald-950]="product.isActive"
                    [class.text-emerald-400]="product.isActive"
                    [class.bg-rose-950]="!product.isActive"
                    [class.text-rose-400]="!product.isActive">
                    {{ product.isActive ? 'Active' : 'Archived' }}
                  </span>
                </td>

                <!-- Actions (Edit & Archive) -->
                <td class="py-3.5 px-4 text-right space-x-2">
                  <button 
                    (click)="openEditModal(product)"
                    class="p-1.5 rounded-lg bg-aurora-darker hover:bg-aurora-cardHover text-aurora-gold transition-colors"
                    title="Edit Mask Specs">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <button 
                    (click)="deleteProduct(product)"
                    class="p-1.5 rounded-lg bg-aurora-darker hover:bg-rose-950/80 text-aurora-sand/50 hover:text-rose-400 transition-colors"
                    title="Permanently Delete Mask">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add / Edit Mask Modal Dialog -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-aurora-card border border-aurora-border rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
          
          <div class="flex items-center justify-between pb-4 border-b border-aurora-border/60">
            <h3 class="font-serif text-xl font-bold text-white">
              {{ editingProduct ? 'Edit Artisan Mask Specifications' : 'Catalog New Handcrafted Mask' }}
            </h3>
            <button (click)="closeModal()" class="text-aurora-sand/50 hover:text-white p-1 rounded-lg">
              ✕
            </button>
          </div>

          <form [formGroup]="productForm" (ngSubmit)="saveProduct()" class="space-y-4">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Name -->
              <div>
                <label class="block text-xs text-aurora-sand/70 mb-1">Mask Title *</label>
                <input 
                  type="text" 
                  formControlName="name" 
                  placeholder="The Oracle of Dougga" 
                  class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold" />
              </div>

              <!-- Category -->
              <div>
                <label class="block text-xs text-aurora-sand/70 mb-1">Lineage Category *</label>
                <select 
                  formControlName="categoryId" 
                  class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold">
                  <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
                </select>
              </div>
            </div>

            <!-- Short Description -->
            <div>
              <label class="block text-xs text-aurora-sand/70 mb-1">Short Summary (Gallery Card)</label>
              <input 
                type="text" 
                formControlName="shortDescription" 
                placeholder="Hand-carved ancestral Berber tribal mask..." 
                class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold" />
            </div>

            <!-- Detailed Description -->
            <div>
              <label class="block text-xs text-aurora-sand/70 mb-1">Artisan Provenance &amp; Detailed Description *</label>
              <textarea 
                formControlName="detailedDescription" 
                rows="3" 
                placeholder="Sculpted from a single block of century-old olive wood root in Kairouan..." 
                class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold"></textarea>
            </div>

            <!-- Wood Type & Dimensions -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs text-aurora-sand/70 mb-1">Wood Type *</label>
                <input 
                  type="text" 
                  formControlName="woodType" 
                  placeholder="Ancient Olive Wood" 
                  class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold" />
              </div>

              <div>
                <label class="block text-xs text-aurora-sand/70 mb-1">Dimensions *</label>
                <input 
                  type="text" 
                  formControlName="dimensions" 
                  placeholder="48cm x 24cm x 11cm" 
                  class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold" />
              </div>

              <div>
                <label class="block text-xs text-aurora-sand/70 mb-1">Weight (Grams)</label>
                <input 
                  type="number" 
                  formControlName="weightGrams" 
                  placeholder="2400" 
                  class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold" />
              </div>
            </div>

            <!-- Pricing & Stock -->
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label class="block text-xs text-aurora-sand/70 mb-1">Price (EUR) *</label>
                <input 
                  type="number" 
                  formControlName="priceEur" 
                  placeholder="340.00" 
                  class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold" />
              </div>

              <div>
                <label class="block text-xs text-aurora-sand/70 mb-1">Price (USD) *</label>
                <input 
                  type="number" 
                  formControlName="priceUsd" 
                  placeholder="370.00" 
                  class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold" />
              </div>

              <div>
                <label class="block text-xs text-aurora-sand/70 mb-1">Discount %</label>
                <input 
                  type="number" 
                  formControlName="discountPercentage" 
                  placeholder="0" 
                  class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold" />
              </div>

              <div>
                <label class="block text-xs text-aurora-sand/70 mb-1">Stock Count *</label>
                <input 
                  type="number" 
                  formControlName="stockQuantity" 
                  placeholder="5" 
                  class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold" />
              </div>
            </div>

            <!-- Artisanal Mask Photography (Multi-Image Upload & Live Gallery Previews) -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-xs text-aurora-sand/70 font-medium">Artisanal Mask Photography (Multi-Image Angles) *</label>
                <span class="text-[10px] text-aurora-gold font-mono">{{ uploadedImageUrls.length }} {{ uploadedImageUrls.length === 1 ? 'image' : 'images' }} attached</span>
              </div>
              
              <!-- Hidden Multi-File Input -->
              <input 
                type="file" 
                #fileInput
                (change)="onFilesSelected($event)" 
                accept="image/jpeg,image/png,image/webp,image/gif" 
                multiple
                class="hidden" />

              <div class="space-y-3">
                <!-- Preview Gallery Grid when Images are Available -->
                <div *ngIf="uploadedImageUrls.length > 0" class="space-y-3">
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div 
                      *ngFor="let url of uploadedImageUrls; let i = index" 
                      class="group relative rounded-xl overflow-hidden border bg-aurora-darker p-1.5 flex flex-col justify-between transition-all"
                      [class.border-aurora-gold]="i === 0"
                      [class.border-aurora-border]="i !== 0">
                      
                      <div class="relative w-full h-24 rounded-lg overflow-hidden bg-black/40">
                        <img [src]="url | imageUrl" alt="Mask Angle" class="w-full h-full object-cover" />
                        <span *ngIf="i === 0" class="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-aurora-gold text-aurora-darker font-bold text-[9px] uppercase tracking-wider shadow">
                          Primary
                        </span>
                      </div>

                      <div class="w-full flex items-center justify-between mt-1.5 px-1">
                        <button 
                          *ngIf="i !== 0"
                          type="button" 
                          (click)="setAsPrimary(i)" 
                          class="text-[10px] text-aurora-gold hover:underline font-medium">
                          Set Primary
                        </button>
                        <span *ngIf="i === 0" class="text-[10px] text-aurora-gold/80 font-mono">Angle 1</span>

                        <button 
                          type="button" 
                          (click)="removeImage(i)" 
                          class="text-rose-400 hover:text-rose-300 p-0.5 rounded hover:bg-rose-500/10 transition-colors"
                          title="Remove Angle">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </div>
                    </div>

                    <!-- Quick Add More Tile -->
                    <button 
                      type="button"
                      (click)="fileInput.click()" 
                      [disabled]="uploadingImage"
                      class="h-32 rounded-xl border border-dashed border-aurora-border hover:border-aurora-gold/60 bg-aurora-darker/40 hover:bg-aurora-darker/80 flex flex-col items-center justify-center p-2 text-center transition-all group">
                      <span class="w-7 h-7 rounded-full bg-aurora-card border border-aurora-border group-hover:border-aurora-gold/50 flex items-center justify-center text-aurora-gold mb-1">
                        +
                      </span>
                      <span class="text-[10px] text-aurora-sand/70 font-medium">Add Photos</span>
                    </button>
                  </div>
                </div>

                <!-- Empty State Upload Area -->
                <div 
                  *ngIf="uploadedImageUrls.length === 0"
                  (click)="fileInput.click()"
                  class="border-2 border-dashed border-aurora-border/80 hover:border-aurora-gold/60 rounded-xl p-6 text-center cursor-pointer transition-colors bg-aurora-darker/40 hover:bg-aurora-darker/70">
                  <div class="w-10 h-10 rounded-full bg-aurora-darker border border-aurora-border flex items-center justify-center mx-auto mb-2 text-aurora-gold">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p class="text-xs text-white font-medium">Click to select one or multiple artisanal mask photographs</p>
                  <p class="text-[10px] text-aurora-sand/50 mt-1">Multi-selection supported (Front, Profile, Grain) • JPEG, PNG, WebP or GIF up to 10MB each</p>
                </div>

                <!-- Loading State during Upload -->
                <div *ngIf="uploadingImage" class="p-2.5 rounded-lg bg-aurora-darker border border-aurora-gold/30 flex items-center gap-2 text-xs text-aurora-gold">
                  <span class="w-3.5 h-3.5 border-2 border-aurora-gold border-t-transparent rounded-full animate-spin"></span>
                  <span>Uploading mask photographs to atelier storage...</span>
                </div>

                <!-- Error Notice -->
                <div *ngIf="imageUploadError" class="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px]">
                  {{ imageUploadError }}
                </div>

                <!-- Fallback Direct URL input -->
                <div class="pt-1 flex items-center gap-2">
                  <input 
                    #customUrlInput
                    type="url" 
                    placeholder="Or paste custom image URL (e.g. Unsplash or /uploads/)..." 
                    class="flex-1 bg-aurora-darker border border-aurora-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-aurora-gold" />
                  <button 
                    type="button" 
                    (click)="addCustomUrl(customUrlInput.value); customUrlInput.value=''" 
                    class="px-3.5 py-2 rounded-xl bg-aurora-card hover:bg-aurora-cardHover text-[11px] font-semibold text-aurora-gold border border-aurora-border transition-colors whitespace-nowrap">
                    + Add URL
                  </button>
                </div>

              </div>
            </div>

            <!-- Featured Checkbox -->
            <div class="flex items-center gap-3 pt-2">
              <label class="flex items-center gap-2 cursor-pointer text-xs text-white">
                <input type="checkbox" formControlName="isFeatured" class="rounded bg-aurora-darker border-aurora-border text-aurora-gold focus:ring-0" />
                <span>Feature in Homepage Spotlight</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer text-xs text-white ml-6">
                <input type="checkbox" formControlName="isActive" class="rounded bg-aurora-darker border-aurora-border text-aurora-gold focus:ring-0" />
                <span>Active in Public Store</span>
              </label>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-aurora-border/60">
              <button 
                type="button" 
                (click)="closeModal()" 
                class="px-5 py-2.5 rounded-xl bg-aurora-darker hover:bg-aurora-cardHover text-xs text-aurora-sand font-medium">
                Cancel
              </button>
              <button 
                type="submit" 
                [disabled]="productForm.invalid || saving"
                class="px-6 py-2.5 rounded-xl bg-aurora-gold text-aurora-darker font-bold text-xs uppercase tracking-wider hover:bg-aurora-goldLight transition-colors disabled:opacity-50">
                <span *ngIf="!saving">{{ editingProduct ? 'Save Changes' : 'Catalog Mask' }}</span>
                <span *ngIf="saving">Saving...</span>
              </button>
            </div>

          </form>

        </div>
      </div>

    </div>
  `
})
export class ProductManagementComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly productService = inject(ProductService);
  private readonly fb = inject(FormBuilder);

  products: ProductDetail[] = [];
  categories: Category[] = [];
  loading = true;
  saving = false;
  searchQuery = '';

  showModal = false;
  editingProduct: ProductDetail | null = null;

  selectedImageFile: File | null = null;
  imagePreviewUrl: string | null = null;
  uploadedImageUrls: string[] = [];
  uploadingImage = false;
  imageUploadError = '';
  feedbackMessage = '';

  productForm = this.fb.group({
    categoryId: [1, [Validators.required]],
    name: ['', [Validators.required]],
    shortDescription: [''],
    detailedDescription: ['', [Validators.required]],
    woodType: ['', [Validators.required]],
    dimensions: ['', [Validators.required]],
    weightGrams: [2000],
    priceEur: [300, [Validators.required, Validators.min(1)]],
    priceUsd: [330, [Validators.required, Validators.min(1)]],
    discountPercentage: [0],
    stockQuantity: [5, [Validators.required, Validators.min(0)]],
    imageUrl: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=85'],
    isFeatured: [false],
    isActive: [true]
  });

  ngOnInit(): void {
    this.productService.getCategories().subscribe(res => {
      this.categories = res.data;
    });
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.adminService.getProducts(0, 50, this.searchQuery).subscribe({
      next: (res) => {
        this.products = res.data.content;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  adjustStock(product: ProductDetail, change: number): void {
    const newStock = Math.max(0, product.stockQuantity + change);
    this.adminService.updateStock(product.id, newStock).subscribe({
      next: () => {
        product.stockQuantity = newStock;
      }
    });
  }

  deleteProduct(product: ProductDetail): void {
    if (confirm(`Permanently delete mask "${product.name}"? This action permanently removes the record and associated images from the atelier. This cannot be undone.`)) {
      this.adminService.deleteProduct(product.id).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== product.id);
          this.feedbackMessage = `Permanently deleted mask "${product.name}".`;
          setTimeout(() => this.feedbackMessage = '', 5000);
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to delete mask product.');
        }
      });
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const validFiles: File[] = [];

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        this.imageUploadError = `Invalid format on ${file.name}. Allowed: JPEG, PNG, WebP, GIF.`;
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.imageUploadError = `File ${file.name} exceeds 10MB limit.`;
        return;
      }
      validFiles.push(file);
    }

    this.imageUploadError = '';
    this.uploadingImage = true;

    this.adminService.uploadImages(validFiles).subscribe({
      next: (res) => {
        this.uploadingImage = false;
        if (res.data?.imageUrls && res.data.imageUrls.length > 0) {
          this.uploadedImageUrls.push(...res.data.imageUrls);
        }
        input.value = '';
      },
      error: (err) => {
        this.uploadingImage = false;
        this.imageUploadError = err.error?.message || 'Failed to upload images to atelier storage.';
        input.value = '';
      }
    });
  }

  setAsPrimary(index: number): void {
    if (index > 0 && index < this.uploadedImageUrls.length) {
      const selected = this.uploadedImageUrls.splice(index, 1)[0];
      this.uploadedImageUrls.unshift(selected);
    }
  }

  removeImage(index: number): void {
    this.uploadedImageUrls.splice(index, 1);
  }

  addCustomUrl(url: string): void {
    const trimmed = url.trim();
    if (trimmed && (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/uploads/'))) {
      this.uploadedImageUrls.push(trimmed);
      this.imageUploadError = '';
    } else if (trimmed) {
      this.imageUploadError = 'Please enter a valid HTTP/HTTPS URL or /uploads/ path.';
    }
  }

  openCreateModal(): void {
    this.editingProduct = null;
    this.uploadedImageUrls = [];
    this.imageUploadError = '';
    this.productForm.reset({
      categoryId: this.categories.length > 0 ? this.categories[0].id : 1,
      name: '',
      shortDescription: '',
      detailedDescription: '',
      woodType: 'Century-Old Tunisian Olive Wood',
      dimensions: '45cm x 22cm x 10cm',
      weightGrams: 2200,
      priceEur: 350,
      priceUsd: 380,
      discountPercentage: 0,
      stockQuantity: 5,
      imageUrl: '',
      isFeatured: false,
      isActive: true
    });
    this.showModal = true;
  }

  openEditModal(product: ProductDetail): void {
    this.editingProduct = product;
    this.uploadedImageUrls = product.images && product.images.length > 0 
      ? product.images.map(img => img.imageUrl) 
      : (product.primaryImageUrl ? [product.primaryImageUrl] : []);
    this.imageUploadError = '';
    this.productForm.patchValue({
      categoryId: product.categoryId,
      name: product.name,
      shortDescription: product.shortDescription,
      detailedDescription: product.detailedDescription,
      woodType: product.woodType,
      dimensions: product.dimensions,
      weightGrams: product.weightGrams,
      priceEur: product.priceEur,
      priceUsd: product.priceUsd,
      discountPercentage: product.discountPercentage,
      stockQuantity: product.stockQuantity,
      imageUrl: product.primaryImageUrl,
      isFeatured: product.isFeatured,
      isActive: product.isActive
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingProduct = null;
    this.uploadedImageUrls = [];
    this.imageUploadError = '';
  }

  saveProduct(): void {
    if (this.productForm.invalid) return;

    this.saving = true;
    const formVal = this.productForm.value;

    const payload: CreateProductPayload = {
      categoryId: Number(formVal.categoryId),
      name: formVal.name!,
      shortDescription: formVal.shortDescription || undefined,
      detailedDescription: formVal.detailedDescription!,
      woodType: formVal.woodType!,
      dimensions: formVal.dimensions!,
      weightGrams: formVal.weightGrams ? Number(formVal.weightGrams) : undefined,
      priceEur: Number(formVal.priceEur),
      priceUsd: Number(formVal.priceUsd),
      discountPercentage: formVal.discountPercentage ? Number(formVal.discountPercentage) : 0,
      stockQuantity: Number(formVal.stockQuantity),
      isFeatured: !!formVal.isFeatured,
      isActive: !!formVal.isActive,
      imageUrls: this.uploadedImageUrls.length > 0 ? this.uploadedImageUrls : (formVal.imageUrl ? [formVal.imageUrl] : [])
    };

    if (this.editingProduct) {
      this.adminService.updateProduct(this.editingProduct.id, payload).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadProducts();
          this.feedbackMessage = 'Mask specifications successfully updated.';
          setTimeout(() => this.feedbackMessage = '', 4000);
        },
        error: (err) => {
          this.saving = false;
          alert(err.error?.message || 'Failed to update mask.');
        }
      });
    } else {
      this.adminService.createProduct(payload).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadProducts();
          this.feedbackMessage = 'New artisanal mask cataloged successfully.';
          setTimeout(() => this.feedbackMessage = '', 4000);
        },
        error: (err) => {
          this.saving = false;
          alert(err.error?.message || 'Failed to create mask.');
        }
      });
    }
  }
}
