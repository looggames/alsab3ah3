import { createClient } from '@supabase/supabase-js';
import { CompanyProfile, Customer, Invoice, Product, ProductCategory, StockAlert, ZatcaLog } from '../types';
import {
  initialCategories,
  initialCompanyProfile,
  initialCustomers,
  initialInvoices,
  initialProducts,
  initialStockAlerts,
  initialZatcaLogs,
} from '../data/mockData';

// User-provided Supabase configuration
const metaEnv = (import.meta as any)?.env || {};
export const SUPABASE_URL =
  metaEnv.VITE_SUPABASE_URL ||
  metaEnv.NEXT_PUBLIC_SUPABASE_URL ||
  'https://hhpzsmytxicwseosvotu.supabase.co';

export const SUPABASE_ANON_KEY =
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  metaEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_4lhX_MdVT7vIUShCwyRntw_scaqqSQc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Complete SQL Schema script ready to be executed in Supabase SQL Editor.
 * Creates all tables, user isolation columns, foreign keys, and Row Level Security (RLS) policies.
 */
export const SUPABASE_SETUP_SQL = `-- ==============================================================================
-- منظومة سحاب للمحاسبة ونقاط البيع والفاتورة الإلكترونية (ZATCA Phase 2)
-- SAHAB POS & TAX MANAGEMENT SYSTEM - COMPLETE MULTI-TENANT DATABASE SCHEMA
-- ==============================================================================

-- 1. جدول ملف المنشأة والإعدادات الضريبية (Company Profiles)
CREATE TABLE IF NOT EXISTS public.company_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name_ar TEXT NOT NULL DEFAULT '',
    name_en TEXT DEFAULT '',
    tax_number TEXT NOT NULL DEFAULT '',
    cr_number TEXT NOT NULL DEFAULT '',
    branch_name TEXT DEFAULT '',
    building_number TEXT DEFAULT '',
    street_name TEXT DEFAULT '',
    district TEXT DEFAULT '',
    city TEXT DEFAULT '',
    postal_code TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    default_vat_rate NUMERIC(4,2) DEFAULT 0.15,
    csid_status TEXT DEFAULT 'pending',
    environment TEXT DEFAULT 'production',
    zatca_config JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول المنتجات والمخزون (Products & Inventory)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    barcode TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'عام',
    cost_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    vat_rate NUMERIC(4,2) NOT NULL DEFAULT 0.15,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock_alert INTEGER NOT NULL DEFAULT 5,
    unit TEXT DEFAULT 'حبة',
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول العملاء والشركات (Customers)
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    company_name TEXT,
    tax_number TEXT,
    cr_number TEXT,
    phone TEXT DEFAULT '-',
    email TEXT DEFAULT '-',
    city TEXT DEFAULT 'الرياض',
    address TEXT DEFAULT 'المملكة العربية السعودية',
    total_purchases NUMERIC(12,2) DEFAULT 0.00,
    balance NUMERIC(12,2) DEFAULT 0.00,
    invoices_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول الفواتير الإلكترونية (Invoices)
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    invoice_number TEXT NOT NULL,
    uuid TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_tax_number TEXT,
    customer_type TEXT DEFAULT 'individual',
    customer_address TEXT,
    type TEXT NOT NULL DEFAULT 'simplified', -- 'simplified' or 'standard'
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_discount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_vat NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    payment_method TEXT NOT NULL DEFAULT 'card',
    zatca_status TEXT NOT NULL DEFAULT 'cleared',
    zatca_submission_date TIMESTAMPTZ,
    cryptographic_stamp TEXT,
    qr_code_data TEXT NOT NULL,
    branch TEXT DEFAULT 'الفرع الرئيسي',
    cashier_name TEXT DEFAULT 'كاشير رئيسي',
    notes TEXT,
    edit_history JSONB DEFAULT '[]'::jsonb,
    last_edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول تنبيهات المخزون (Stock Alerts)
CREATE TABLE IF NOT EXISTS public.stock_alerts (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_name TEXT NOT NULL,
    category TEXT NOT NULL,
    remaining INTEGER NOT NULL,
    min_alert INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. جدول سجلات التكامل مع هيئة الزكاة (ZATCA Integration Logs)
CREATE TABLE IF NOT EXISTS public.zatca_logs (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    invoice_number TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    status TEXT NOT NULL,
    message TEXT NOT NULL,
    status_code INTEGER NOT NULL DEFAULT 200,
    hash TEXT NOT NULL,
    duration_ms INTEGER NOT NULL DEFAULT 40,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. جدول التصنيفات المخصصة (Categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    name_en TEXT,
    description TEXT,
    icon TEXT DEFAULT 'Folder',
    color TEXT DEFAULT '#006c35',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- تفعيل أمان مستوى الصفوف (Row Level Security - RLS) لعزل بيانات كل مستخدم
-- ==============================================================================

ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zatca_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access own categories" ON public.categories
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- السياسات الأمنية: تتيح لكل مستخدم فقط إدارة وقراءة بياناته الخاصة
CREATE POLICY "Users can manage own company profile"
    ON public.company_profiles FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own products"
    ON public.products FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own customers"
    ON public.customers FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own invoices"
    ON public.invoices FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own stock alerts"
    ON public.stock_alerts FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own zatca logs"
    ON public.zatca_logs FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- إنشاء دالة لتهيئة بيانات المستخدم الجديد تلقائياً فور التسجيل (Trigger)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.company_profiles (user_id, name_ar, tax_number, cr_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'tax_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'cr_number', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_setup();
`;

// Helper: Clear all user tenant data (invoices, products, customers, alerts, logs, categories)
export async function clearAllUserData(userId: string) {
  try {
    await Promise.all([
      supabase.from('invoices').delete().eq('user_id', userId),
      supabase.from('products').delete().eq('user_id', userId),
      supabase.from('customers').delete().eq('user_id', userId),
      supabase.from('stock_alerts').delete().eq('user_id', userId),
      supabase.from('zatca_logs').delete().eq('user_id', userId),
      supabase.from('categories').delete().eq('user_id', userId),
    ]);
    return true;
  } catch (err) {
    console.error('Error clearing tenant data:', err);
    return false;
  }
}

// Helper: Sanitize company profile to eliminate any legacy mock/default values
export function sanitizeCompanyProfile(rawProfile: any, fallbackName: string = 'منشأة تجارية'): CompanyProfile {
  if (!rawProfile || typeof rawProfile !== 'object') {
    return {
      nameAr: fallbackName,
      nameEn: '',
      taxNumber: '',
      crNumber: '',
      branchName: fallbackName || 'الفرع الرئيسي',
      cashierName: fallbackName || 'كاشير رئيسي',
      buildingNumber: '',
      streetName: '',
      district: '',
      city: '',
      postalCode: '',
      phone: '',
      email: '',
      defaultVatRate: 0.15,
      csidStatus: 'pending',
      environment: 'production',
      zatcaConfig: {
        environment: 'production',
        egsUuid: '',
        egsSerialNumber: '',
        solutionName: 'نظام الفوترة ونقاط البيع الإلكترونية',
        model: 'POS-01',
        otp: '',
        csidStatus: 'pending',
        isOnboarded: false,
      },
    };
  }

  // Detect and purge legacy placeholder/mock strings
  const cleanTax = (rawProfile.taxNumber || rawProfile.tax_number || '').trim();
  const isMockTax =
    cleanTax === '310987654300003' ||
    cleanTax === '310123456700003' ||
    cleanTax === '300000000000003' ||
    cleanTax === '300987654300003' ||
    cleanTax === '311223344500003';

  const cleanCr = (rawProfile.crNumber || rawProfile.cr_number || '').trim();
  const isMockCr =
    cleanCr === '1010876543' ||
    cleanCr === '1010000000' ||
    cleanCr === '7000000000';

  const cleanNameEn = (rawProfile.nameEn || rawProfile.name_en || '').trim();
  const isMockNameEn =
    cleanNameEn === 'Sahab Trading Est.' ||
    cleanNameEn === 'Al-Sabah Trading Est.' ||
    cleanNameEn === 'Sahab Trading';

  const cleanBuilding = (rawProfile.buildingNumber || rawProfile.building_number || '').trim();
  const isMockBuilding = cleanBuilding === '3452' || cleanBuilding === '1234';

  const cleanPostal = (rawProfile.postalCode || rawProfile.postal_code || '').trim();
  const isMockPostal = cleanPostal === '12214' || cleanPostal === '12211';

  const cleanDistrict = (rawProfile.district || '').trim();
  const isMockDistrict = cleanDistrict === 'حي العليا';

  const cleanStreet = (rawProfile.streetName || rawProfile.street_name || '').trim();
  const isMockStreet = cleanStreet === 'طريق الملك فهد';

  const cleanPhone = (rawProfile.phone || '').trim();
  const isMockPhone =
    cleanPhone === '+966 11 456 7890' ||
    cleanPhone === '0555112233' ||
    cleanPhone === '+966 50 123 4567';

  const cleanCity = (rawProfile.city || '').trim();
  // Only purge city if it was part of the old mock address
  const isMockCity = (isMockDistrict || isMockStreet || isMockBuilding || isMockPostal) && cleanCity === 'الرياض';

  const nameAr = (rawProfile.nameAr || rawProfile.name_ar || '').trim() || fallbackName;

  let rawConfig = rawProfile.zatcaConfig || rawProfile.zatca_config || {};
  if (typeof rawConfig === 'string') {
    try {
      rawConfig = JSON.parse(rawConfig);
    } catch {
      rawConfig = {};
    }
  }

  const hasRealCsid = Boolean(
    rawConfig?.productionCsid &&
    rawConfig.productionCsid.length > 20 &&
    rawConfig.productionCsid !== 'mock-csid'
  );
  const csidStatus = hasRealCsid ? (rawProfile.csidStatus || rawProfile.csid_status || 'active') : 'pending';
  const isOnboarded = hasRealCsid && rawConfig.isOnboarded === true;

  const finalCr = isMockCr ? '' : cleanCr;

  return {
    nameAr: nameAr,
    nameEn: isMockNameEn ? '' : cleanNameEn,
    taxNumber: isMockTax ? '' : cleanTax,
    crNumber: finalCr,
    branchName: (rawProfile.branchName || rawProfile.branch_name || '').trim() || nameAr || 'الفرع الرئيسي',
    cashierName: (rawProfile.cashierName || rawProfile.cashier_name || '').trim() || nameAr || 'كاشير رئيسي',
    buildingNumber: isMockBuilding ? '' : cleanBuilding,
    streetName: isMockStreet ? '' : cleanStreet,
    district: isMockDistrict ? '' : cleanDistrict,
    city: isMockCity ? '' : cleanCity,
    postalCode: isMockPostal ? '' : cleanPostal,
    phone: isMockPhone ? '' : cleanPhone,
    email: (rawProfile.email || '').trim(),
    defaultVatRate: Number(rawProfile.defaultVatRate || rawProfile.default_vat_rate || 0.15),
    csidStatus: csidStatus,
    environment: rawProfile.environment || 'production',
    zatcaConfig: {
      environment: rawConfig.environment || 'production',
      egsUuid: rawConfig.egsUuid || '',
      egsSerialNumber: finalCr ? `EGS-${finalCr}-01` : '',
      solutionName: rawConfig.solutionName || 'نظام الفوترة ونقاط البيع الإلكترونية',
      model: rawConfig.model || 'POS-01',
      otp: '',
      csidStatus: csidStatus,
      isOnboarded: isOnboarded,
      complianceCsid: hasRealCsid ? (rawConfig.complianceCsid || '') : '',
      complianceSecret: hasRealCsid ? (rawConfig.complianceSecret || '') : '',
      productionCsid: hasRealCsid ? rawConfig.productionCsid : '',
      productionSecret: hasRealCsid ? (rawConfig.productionSecret || '') : '',
      privateKey: hasRealCsid ? rawConfig.privateKey : '',
      publicKey: hasRealCsid ? rawConfig.publicKey : '',
      csr: hasRealCsid ? rawConfig.csr : '',
    },
  };
}

// Helper: Seed Initial Company Profile for a new tenant in Supabase
export async function seedUserStarterData(userId: string, companyName?: string, taxNumber?: string, crNumber?: string) {
  try {
    const defaultCr = crNumber || '';
    const initialConfig = {
      environment: 'production',
      egsUuid: '',
      egsSerialNumber: defaultCr ? `EGS-${defaultCr}-01` : '',
      solutionName: 'نظام الفوترة ونقاط البيع الإلكترونية',
      model: 'POS-01',
      otp: '',
      csidStatus: 'pending',
      isOnboarded: false,
    };

    // Only initialize clean Company Profile for new tenant
    await supabase.from('company_profiles').upsert({
      user_id: userId,
      name_ar: companyName || 'منشأة تجارية جديدة',
      name_en: '',
      tax_number: taxNumber || '',
      cr_number: defaultCr,
      branch_name: companyName || 'الفرع الرئيسي',
      cashier_name: companyName || 'كاشير رئيسي',
      building_number: '',
      street_name: '',
      district: '',
      city: '',
      postal_code: '',
      phone: '',
      email: '',
      default_vat_rate: 0.15,
      csid_status: 'pending',
      environment: 'production',
      zatca_config: initialConfig,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  } catch (err) {
    console.warn('Initial profile setup notice:', err);
  }
}

// Fetch all tenant data from Supabase
export async function fetchTenantData(userId: string) {
  try {
    const [
      profileRes,
      productsRes,
      customersRes,
      invoicesRes,
      alertsRes,
      logsRes,
      categoriesRes,
    ] = await Promise.all([
      supabase.from('company_profiles').select('*').eq('user_id', userId).single(),
      supabase.from('products').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('customers').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('invoices').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('stock_alerts').select('*').eq('user_id', userId),
      supabase.from('zatca_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('categories').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    ]);

    // Format products
    const products: Product[] | null = productsRes.data
      ? productsRes.data.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          barcode: p.barcode,
          category: p.category,
          costPrice: Number(p.cost_price),
          sellingPrice: Number(p.selling_price),
          vatRate: Number(p.vat_rate),
          stock: Number(p.stock),
          minStockAlert: Number(p.min_stock_alert),
          unit: p.unit || 'حبة',
          image: p.image,
        }))
      : null;

    // Format customers
    const customers: Customer[] | null = customersRes.data
      ? customersRes.data.map((c) => ({
          id: c.id,
          name: c.name,
          companyName: c.company_name || undefined,
          taxNumber: c.tax_number || undefined,
          crNumber: c.cr_number || undefined,
          phone: c.phone || '-',
          email: c.email || '-',
          city: c.city || 'الرياض',
          address: c.address || 'الرياض',
          totalPurchases: Number(c.total_purchases || 0),
          balance: Number(c.balance || 0),
          invoicesCount: Number(c.invoices_count || 0),
        }))
      : null;

    // Format invoices
    const invoices: Invoice[] | null = invoicesRes.data
      ? invoicesRes.data.map((inv) => {
          let parsedHistory: any[] = [];
          if (Array.isArray(inv.edit_history)) {
            parsedHistory = inv.edit_history;
          } else if (typeof inv.edit_history === 'string') {
            try {
              parsedHistory = JSON.parse(inv.edit_history);
            } catch {
              parsedHistory = [];
            }
          }

          let parsedItems: any[] = [];
          if (Array.isArray(inv.items)) {
            parsedItems = inv.items;
          } else if (typeof inv.items === 'string') {
            try {
              parsedItems = JSON.parse(inv.items);
            } catch {
              parsedItems = [];
            }
          }

          return {
            id: inv.id,
            invoiceNumber: inv.invoice_number,
            uuid: inv.uuid,
            date: inv.date,
            time: inv.time,
            customerName: inv.customer_name,
            customerTaxNumber: inv.customer_tax_number || undefined,
            customerType: inv.customer_type,
            customerAddress: inv.customer_address || undefined,
            type: inv.type,
            items: parsedItems,
            subtotal: Number(inv.subtotal),
            totalDiscount: Number(inv.total_discount),
            totalVat: Number(inv.total_vat),
            grandTotal: Number(inv.grand_total),
            paymentMethod: inv.payment_method,
            zatcaStatus: inv.zatca_status,
            zatcaSubmissionDate: inv.zatca_submission_date || undefined,
            cryptographicStamp: inv.cryptographic_stamp || undefined,
            qrCodeData: inv.qr_code_data,
            branch: inv.branch || 'الفرع الرئيسي',
            cashierName: inv.cashier_name || 'كاشير رئيسي',
            notes: inv.notes || undefined,
            editHistory: parsedHistory,
            lastEditedAt: inv.last_edited_at || undefined,
          };
        })
      : null;

    // Format company profile
    let profile: CompanyProfile | null = null;
    if (profileRes.data) {
      profile = sanitizeCompanyProfile(profileRes.data, profileRes.data.name_ar);
    }

    // Format stock alerts
    const stockAlerts: StockAlert[] | null = alertsRes.data
      ? alertsRes.data.map((a) => ({
          id: a.id,
          productName: a.product_name,
          category: a.category,
          remaining: Number(a.remaining),
          minAlert: Number(a.min_alert),
        }))
      : null;

    // Format ZATCA logs
    const zatcaLogs: ZatcaLog[] | null = logsRes.data
      ? logsRes.data.map((l) => ({
          id: l.id,
          invoiceNumber: l.invoice_number,
          timestamp: l.timestamp,
          status: l.status,
          message: l.message,
          statusCode: Number(l.status_code),
          hash: l.hash,
          durationMs: Number(l.duration_ms),
        }))
      : null;

    // Format Categories
    const categories: ProductCategory[] | null = categoriesRes.data
      ? categoriesRes.data.map((c) => ({
          id: c.id,
          name: c.name,
          nameEn: c.name_en || undefined,
          description: c.description || undefined,
          icon: c.icon || 'Folder',
          color: c.color || '#006c35',
        }))
      : null;

    return {
      profile,
      products,
      customers,
      invoices,
      stockAlerts,
      zatcaLogs,
      categories,
      hasDbData: Boolean(profileRes.data || (products && products.length > 0)),
    };
  } catch (err) {
    console.error('Error fetching Supabase tenant data:', err);
    return {
      profile: null,
      products: null,
      customers: null,
      invoices: null,
      stockAlerts: null,
      zatcaLogs: null,
      categories: null,
      hasDbData: false,
    };
  }
}
