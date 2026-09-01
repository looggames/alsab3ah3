import React, { useState } from 'react';
import { Customer } from '../types';
import { formatCurrency } from '../utils/zatca';
import { Search, Plus, User, Building, Phone, Mail, MapPin, X, CheckCircle2, FileText, ShoppingBag, Edit3, Trash2, AlertTriangle } from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer?: (customer: Customer) => void;
  onDeleteCustomer?: (customerId: string) => void;
  onNewInvoiceForCustomer?: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onNewInvoiceForCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  // New Customer State
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [crNumber, setCrNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  // Edit Customer State
  const [editName, setEditName] = useState('');
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editTaxNumber, setEditTaxNumber] = useState('');
  const [editCrNumber, setEditCrNumber] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editAddress, setEditAddress] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.taxNumber && c.taxNumber.includes(searchQuery)) ||
      c.phone.includes(searchQuery)
  );

  const handleOpenEdit = (cust: Customer) => {
    setEditingCustomer(cust);
    setEditName(cust.name);
    setEditCompanyName(cust.companyName || '');
    setEditTaxNumber(cust.taxNumber || '');
    setEditCrNumber(cust.crNumber || '');
    setEditPhone(cust.phone === '-' ? '' : cust.phone);
    setEditEmail(cust.email === '-' ? '' : cust.email);
    setEditCity(cust.city || '');
    setEditAddress(cust.address || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !editName.trim()) return;

    const updatedCust: Customer = {
      ...editingCustomer,
      name: editName.trim(),
      companyName: editCompanyName.trim() || undefined,
      taxNumber: editTaxNumber.trim() || undefined,
      crNumber: editCrNumber.trim() || undefined,
      phone: editPhone.trim() || '-',
      email: editEmail.trim() || '-',
      city: editCity.trim() || '',
      address: editAddress.trim() || '',
    };

    if (onUpdateCustomer) {
      onUpdateCustomer(updatedCust);
    }
    setEditingCustomer(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingCustomer) return;
    if (onDeleteCustomer) {
      onDeleteCustomer(deletingCustomer.id);
    }
    setDeletingCustomer(null);
  };

  const handleCreateCustomer = (e: React.FormEvent, createInvoiceAfter: boolean = false) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      companyName: companyName.trim() || undefined,
      taxNumber: taxNumber.trim() || undefined,
      crNumber: crNumber.trim() || undefined,
      phone: phone.trim() || '-',
      email: email.trim() || '-',
      city: city.trim() || '',
      address: address.trim() || '',
      totalPurchases: 0,
      balance: 0,
      invoicesCount: 0,
    };

    onAddCustomer(newCust);
    setIsAddModalOpen(false);
    
    // Reset fields
    setName('');
    setCompanyName('');
    setTaxNumber('');
    setCrNumber('');
    setPhone('');
    setEmail('');
    setCity('');
    setAddress('');

    if (createInvoiceAfter && onNewInvoiceForCustomer) {
      onNewInvoiceForCustomer(newCust);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-[#becabd] shadow-xs">
          <div>
            <h2 className="text-base md:text-lg font-bold text-[#191c1e]">دليل العملاء والشركات</h2>
            <p className="text-xs text-[#505f76] mt-0.5">
              إدارة بيانات المشترين الخاضعين للفواتير الضريبية القياسية (B2B) والتجزئة (B2C)
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-[#005126] text-white rounded-xl text-xs font-bold hover:bg-[#006c35] flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عميل جديد</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border border-[#becabd] shadow-xs flex justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[#505f76] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، الرقم الضريبي (15 رقم)، أو رقم الهاتف..."
              className="w-full pl-4 pr-9 py-2 bg-[#f7f9fb] border border-[#becabd] rounded-lg text-xs outline-none focus:border-[#005126] text-[#191c1e]"
            />
          </div>

          <span className="text-xs text-[#505f76] font-semibold">
            عدد العملاء: {filteredCustomers.length}
          </span>
        </div>

        {/* Customer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => {
            const isCorporate = Boolean(cust.taxNumber);
            return (
              <div
                key={cust.id}
                className="bg-white border border-[#becabd] rounded-xl p-5 shadow-xs hover:border-[#005126] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Top: Avatar, Name, Type, and Actions */}
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#eceef0]">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${
                          isCorporate ? 'bg-[#006c35]/15 text-[#005126]' : 'bg-[#e0e3e5] text-[#191c1e]'
                        }`}
                      >
                        {isCorporate ? <Building className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-bold text-[#191c1e] truncate" title={cust.name}>
                            {cust.name}
                          </h4>
                          {isCorporate && (
                            <span className="text-[10px] bg-[#d0e1fb] text-[#005126] font-bold px-2 py-0.5 rounded-full shrink-0">
                              ضريبي معتمد
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#505f76] block truncate">
                          {isCorporate ? 'منشأة تجارية (B2B)' : 'عميل أفراد (B2C)'}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons (Edit & Delete) */}
                    <div className="flex items-center gap-1 shrink-0 bg-slate-50 p-1 rounded-lg border border-slate-100">
                      <button
                        onClick={() => handleOpenEdit(cust)}
                        title="تعديل بيانات العميل"
                        className="p-1.5 text-slate-500 hover:text-[#005126] hover:bg-[#005126]/15 rounded-md transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeletingCustomer(cust)}
                        title="حذف العميل"
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#3f4940] pt-1">
                    {cust.taxNumber && (
                      <div className="flex justify-between">
                        <span className="text-[#505f76]">الرقم الضريبي:</span>
                        <span className="font-currency font-bold text-[#005126]">{cust.taxNumber}</span>
                      </div>
                    )}
                    {cust.phone && cust.phone !== '-' && (
                      <div className="flex justify-between">
                        <span className="text-[#505f76]">الهاتف:</span>
                        <span className="font-currency text-[#191c1e]">{cust.phone}</span>
                      </div>
                    )}
                    {cust.address && (
                      <div className="flex justify-between">
                        <span className="text-[#505f76]">العنوان:</span>
                        <span className="text-[#191c1e] truncate max-w-[180px]">{cust.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#eceef0] flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[#505f76] block text-[10px]">إجمالي المشتريات</span>
                      <span className="font-currency font-bold text-[#191c1e]">
                        {formatCurrency(cust.totalPurchases)} ر.س
                      </span>
                    </div>

                    <div className="text-left">
                      <span className="text-[#505f76] block text-[10px]">عدد الفواتير</span>
                      <span className="font-currency font-bold text-[#005126]">
                        {cust.invoicesCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action to create invoice for customer */}
                {onNewInvoiceForCustomer && (
                  <button
                    onClick={() => onNewInvoiceForCustomer(cust)}
                    className="w-full mt-4 py-2 bg-[#005126]/10 text-[#005126] hover:bg-[#005126] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#005126]/20 shadow-xs"
                  >
                    <FileText className="w-4 h-4" />
                    <span>إنشاء فاتورة لهذا العميل</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center justify-center bg-white rounded-xl border border-[#becabd]">
            <User className="w-12 h-12 text-[#505f76]/40 mb-3" />
            <h3 className="text-base font-bold text-[#191c1e]">لا يوجد عملاء مسجلين</h3>
            <p className="text-xs text-[#505f76] mt-1 max-w-sm">
              أضف بيانات عملائك التجاريين (B2B مع الرقم الضريبي) أو الأفراد (B2C) لتسهيل إصدار الفواتير وتحديد الأسعار المخصصة.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-4 py-2 bg-[#005126] text-white rounded-lg text-xs font-bold hover:bg-[#006c35] flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عميل جديد</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#becabd] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#eceef0] pb-3">
              <h3 className="text-lg font-bold text-[#191c1e]">تسجيل عميل جديد</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => handleCreateCustomer(e, false)} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#3f4940] font-semibold mb-1">اسم العميل / الشركة *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: شركة التطوير الحديث"
                  className="w-full p-2.5 bg-[#f7f9fb] border border-[#becabd] rounded-lg outline-none focus:border-[#005126]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#3f4940] font-semibold mb-1">الرقم الضريبي (15 خانة)</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    placeholder="300000000000003"
                    className="w-full p-2.5 bg-[#f7f9fb] border border-[#becabd] rounded-lg outline-none focus:border-[#005126] font-currency"
                  />
                </div>

                <div>
                  <label className="block text-[#3f4940] font-semibold mb-1">رقم السجل التجاري (CR)</label>
                  <input
                    type="text"
                    value={crNumber}
                    onChange={(e) => setCrNumber(e.target.value)}
                    placeholder="1010000000"
                    className="w-full p-2.5 bg-[#f7f9fb] border border-[#becabd] rounded-lg outline-none focus:border-[#005126] font-currency"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#3f4940] font-semibold mb-1">رقم الهاتف / الجوال</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+966 50 000 0000"
                    className="w-full p-2.5 bg-[#f7f9fb] border border-[#becabd] rounded-lg outline-none focus:border-[#005126] font-currency"
                  />
                </div>

                <div>
                  <label className="block text-[#3f4940] font-semibold mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="finance@company.sa"
                    className="w-full p-2.5 bg-[#f7f9fb] border border-[#becabd] rounded-lg outline-none focus:border-[#005126]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#3f4940] font-semibold mb-1">العنوان الوطني / المدينة</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="الرياض، طريق الملك فهد"
                  className="w-full p-2.5 bg-[#f7f9fb] border border-[#becabd] rounded-lg outline-none focus:border-[#005126]"
                />
              </div>

              <div className="pt-3 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={(e) => handleCreateCustomer(e, true)}
                  className="flex-1 py-2.5 bg-[#005126] text-white font-bold rounded-xl hover:bg-[#006c35] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>حفظ وإنشاء فاتورة فوراً</span>
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#f7f9fb] border border-[#becabd] text-[#191c1e] font-bold rounded-xl hover:bg-[#eceef0] transition-colors cursor-pointer"
                >
                  حفظ فقط
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#becabd] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#eceef0] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#005126]/10 text-[#005126] rounded-lg">
                  <Edit3 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#191c1e]">تعديل بيانات العميل</h3>
              </div>
              <button
                onClick={() => setEditingCustomer(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#3f4940] font-semibold mb-1">اسم العميل / الشركة *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 bg-[#f7f9fb] border border-[#becabd] rounded-lg outline-none focus:border-[#005126]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#3f4940] font-semibold mb-1">الرقم الضريبي (15 خانة)</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={editTaxNumber}
                    onChange={(e) => setEditTaxNumber(e.target.value)}
                    placeholder="300000000000003"
                    className="w-full p-2.5 bg-[#f7f9fb] border border-[#becabd] rounded-lg outline-none focus:border-[#005126] font-currency"
                  />
                </div>

                <div>
                  <label className="block text-[#3f4940] font-semibold mb-1">رقم السجل التجاري (CR)</label>
                  <input
                    type="text"
                    value={editCrNumber}
                    onChange={(e) => setEditCrNumber(e.target.value)}
                    placeholder="1010000000"
                    className="w-full p-2.5 bg-[#f7f9fb] border border-[#becabd] rounded-lg outline-none focus:border-[#005126] font-currency"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#3f4940] font-semibold mb-1">رقم الهاتف / الجوال</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+966 50 000 0000"
                    className="w-full p-2.5 bg-[#f7f9fb] border border-[#becabd] rounded-lg outline-none focus:border-[#005126] font-currency"
                  />
                </div>

                <div>
                  <label className="block text-[#3f4940] font-semibold mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="finance@company.sa"
                    className="w-full p-2.5 bg-[#f7f9fb] border border-[#becabd] rounded-lg outline-none focus:border-[#005126]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#3f4940] font-semibold mb-1">العنوان الوطني / المدينة</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="الرياض، طريق الملك فهد"
                  className="w-full p-2.5 bg-[#f7f9fb] border border-[#becabd] rounded-lg outline-none focus:border-[#005126]"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#005126] text-white font-bold rounded-xl hover:bg-[#006c35] transition-colors cursor-pointer shadow-xs"
                >
                  حفظ التعديلات
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Customer Confirmation Modal */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#becabd] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-slate-900">تأكيد حذف العميل</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف العميل{' '}
                <span className="font-bold text-slate-900">"{deletingCustomer.name}"</span> من قاعدة البيانات؟
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
              >
                تأكيد الحذف
              </button>
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

