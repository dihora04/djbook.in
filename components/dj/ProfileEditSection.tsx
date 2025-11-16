
import React, { useState } from 'react';
import { DJProfile } from '../../types';
import { LoaderIcon, MapPinIcon } from '../icons';
import { CITIES, GENRES, EVENT_TYPES } from '../../constants';
import { updateDjProfile } from '../../services/mockApiService';


interface ProfileEditSectionProps {
    dj: DJProfile;
    setDj: React.Dispatch<React.SetStateAction<DJProfile | null>>;
    showToast: (message: string, type?: 'success' | 'error') => void;
}

const ProfileEditSection: React.FC<ProfileEditSectionProps> = ({ dj, setDj, showToast }) => {
    const [formData, setFormData] = useState<Partial<DJProfile>>(dj);
    const [isSaving, setIsSaving] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'minFee' ? parseInt(value) : value }));
    };

    const handleMultiSelectChange = (field: 'genres' | 'eventTypes', value: string) => {
        const currentValues = formData[field] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(item => item !== value)
            : [...currentValues, value];
        setFormData(prev => ({ ...prev, [field]: newValues }));
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            showToast("Geolocation is not supported by your browser.", "error");
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setFormData(prev => ({ ...prev, latitude, longitude }));
                showToast("Location captured successfully!", "success");
                setIsLocating(false);
            },
            () => {
                showToast("Unable to retrieve your location.", "error");
                setIsLocating(false);
            }
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedProfile = await updateDjProfile(dj.id, formData);
            setDj(updatedProfile);
            showToast('Profile updated successfully!', 'success');
        } catch (error) {
            showToast('Failed to update profile.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const InputField = ({ label, name, value, onChange, placeholder, type = "text" }: any) => (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
            <input 
                type={type} 
                name={name} 
                value={value || ''} 
                onChange={onChange} 
                placeholder={placeholder}
                className="w-full bg-brand-dark text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-cyan focus:outline-none"
            />
        </div>
    );

     const MultiSelectGrid = ({ title, options, selected, onChange }: {title: string, options: string[], selected: string[], onChange: (value: string) => void}) => (
        <div>
            <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {options.map(option => (
                    <button 
                        key={option} 
                        type="button"
                        onClick={() => onChange(option)}
                        className={`text-sm text-center p-2 rounded-full border-2 transition-colors ${selected.includes(option) ? 'bg-brand-cyan/20 border-brand-cyan text-white' : 'border-gray-600 text-gray-300 hover:border-brand-cyan/50'}`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Edit Profile</h2>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-brand-violet to-brand-cyan text-white font-bold py-2 px-6 rounded-full hover:scale-105 transition-transform duration-300 disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                >
                    {isSaving ? <LoaderIcon className="w-5 h-5"/> : 'Save Changes'}
                </button>
            </div>
            
            <div className="space-y-6">
                 <div className="bg-brand-dark p-6 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Stage Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., DJ Rohan" />
                    <InputField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g., 9099110411" />
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
                        <select name="city" value={formData.city} onChange={handleChange} className="w-full bg-brand-dark text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-cyan focus:outline-none appearance-none">
                            <option value="">Select City</option>
                            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                     <InputField label="Minimum Fee (per event)" name="minFee" value={formData.minFee} onChange={handleChange} placeholder="e.g., 25000" type="number" />
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} placeholder="Tell us about your style, experience, and what makes you a great DJ." className="w-full bg-brand-dark text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-cyan focus:outline-none"></textarea>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Your Location</label>
                         <button type="button" onClick={handleGetLocation} disabled={isLocating} className="w-full flex justify-center items-center gap-2 p-3 rounded-lg border-2 border-gray-600 hover:border-brand-cyan transition-colors disabled:opacity-50">
                            {isLocating ? <LoaderIcon className="w-5 h-5" /> : <MapPinIcon className="w-5 h-5" />}
                            {isLocating ? 'Getting Location...' : 'Use My Current Location'}
                        </button>
                        {formData.latitude && formData.longitude && (
                            <p className="text-xs text-gray-400 mt-2 text-center">
                                Current Location: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                            </p>
                        )}
                    </div>
                 </div>

                 <div className="bg-brand-dark p-6 rounded-lg space-y-6">
                    <MultiSelectGrid title="Genres You Play" options={GENRES} selected={formData.genres || []} onChange={(val) => handleMultiSelectChange('genres', val)} />
                    <MultiSelectGrid title="Event Types You Specialize In" options={EVENT_TYPES} selected={formData.eventTypes || []} onChange={(val) => handleMultiSelectChange('eventTypes', val)} />
                 </div>
                
                 <div className="bg-brand-dark p-6 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Instagram URL" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/yourprofile" />
                    <InputField label="YouTube URL" name="youtube" value={formData.youtube} onChange={handleChange} placeholder="https://youtube.com/yourchannel" />
                    <InputField label="SoundCloud URL" name="soundcloud" value={formData.soundcloud} onChange={handleChange} placeholder="https://soundcloud.com/yourprofile" />
                 </div>
            </div>
        </div>
    );
};

export default ProfileEditSection;