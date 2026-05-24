'use client';

import { useEffect, useState } from 'react';
import { User as UserIcon, Mail, Phone, Calendar, Shield, Save, MapPin, Plus, Trash2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { AuthGuard } from '@/components/auth-guard';
import type { Address } from '@/types';

function ProfileContent() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  });
  const [addresses, setAddresses] = useState<Address[]>([]);
  
  const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zip: '' });
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
      setAddresses(user.addresses || []);
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Error', description: 'Image size must be less than 2MB', variant: 'error' });
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    try {
      const res = await fetch(`/api/db/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          avatar: formData.avatar,
          addresses: addresses
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update profile');
      }

      const updatedUser = await res.json();
      updateProfile(updatedUser); 
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
        variant: 'success'
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Could not update profile. Please try again.',
        variant: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAddress = () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zip) {
      toast({ title: 'Error', description: 'Please fill all address fields', variant: 'error' });
      return;
    }
    
    const id = Math.random().toString(36).substring(7);
    const updated = [...addresses, { id, ...newAddress, isDefault: addresses.length === 0 }];
    setAddresses(updated);
    setNewAddress({ street: '', city: '', state: '', zip: '' });
    setIsAddingAddress(false);
  };

  const removeAddress = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-heading text-4xl font-bold mb-8 text-foreground">My Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Sidebar Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="glass rounded-3xl p-8 flex flex-col items-center text-center border border-border/50 shadow-sm">
              <div className="relative group mb-4">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="h-24 w-24 rounded-full object-cover border-2 border-primary/20" />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                    <UserIcon className="h-12 w-12 text-primary" />
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                  <Camera className="h-6 w-6" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
              <h2 className="font-heading text-xl font-bold">{user.name}</h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
                <Shield className="h-3.5 w-3.5" />
                <span className="capitalize">{user.role}</span>
              </div>
              
              <div className="w-full border-t border-border/50 mt-6 pt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground justify-center md:justify-start">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground justify-center md:justify-start">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Edit Form */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass rounded-3xl p-8 border border-border/50 shadow-sm">
              <h3 className="font-heading text-2xl font-bold mb-6">Edit Details</h3>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <Input required value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} className="h-12 rounded-xl bg-white/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Phone Number</label>
                    <Input type="tel" value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="h-12 rounded-xl bg-white/50" placeholder="e.g. +1 234 567 8900" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-foreground">Email Address</label>
                    <Input type="email" required value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} className="h-12 rounded-xl bg-white/50" />
                  </div>
                </div>
                <Button type="submit" disabled={isSaving || uploading} className="rounded-xl h-12 px-8 shadow-md">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </div>

            {/* Address Book */}
            <div className="glass rounded-3xl p-8 border border-border/50 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading text-2xl font-bold">Saved Addresses</h3>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setIsAddingAddress(!isAddingAddress)}>
                  <Plus className="h-4 w-4 mr-2" /> Add New
                </Button>
              </div>

              {isAddingAddress && (
                <div className="bg-muted/30 p-6 rounded-2xl mb-6 space-y-4 border border-border/50">
                  <Input placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="bg-white/50" />
                  <div className="grid grid-cols-3 gap-4">
                    <Input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="bg-white/50" />
                    <Input placeholder="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="bg-white/50" />
                    <Input placeholder="ZIP" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} className="bg-white/50" />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={() => setIsAddingAddress(false)}>Cancel</Button>
                    <Button onClick={handleAddAddress}>Save Address</Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {addresses.length === 0 && !isAddingAddress ? (
                  <p className="text-muted-foreground text-sm italic">No addresses saved yet.</p>
                ) : (
                  addresses.map((addr) => (
                    <div key={addr.id} className="flex justify-between items-center p-4 border border-border/50 rounded-xl bg-white/30">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">{addr.street}</p>
                          <p className="text-xs text-muted-foreground">{addr.city}, {addr.state} {addr.zip}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeAddress(addr.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
