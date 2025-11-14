import React, { useState } from 'react';
import { DJProfile } from '../../types';
import { LoaderIcon, CheckCircleIcon } from '../icons';

interface ProfileEditSectionProps {
    dj: DJProfile;
    setDj: React.Dispatch<React.SetStateAction<DJProfile | null>>;
}

// Simulate uploading to a service like Cloudinary
const simulateCloudinaryUpload = (file: File): Promise<{ secure_url: string }> => {
    console.log(`Simulating upload for ${file.name}...`);
    return new Promise(resolve => {
        setTimeout(() => {
            // In a real app, this would be the URL from Cloudinary.
            // Here, we generate a random image from picsum to show a change.
            const newImageUrl = `https://picsum.photos/seed/${Date.now()}/400/400`;
            console.log(`Simulated upload complete. New URL: ${newImageUrl}`);
            resolve({ secure_url: newImageUrl });
        }, 1500); // 1.5 second delay to simulate upload
    });
};


const ProfileEditSection: React.FC<ProfileEditSectionProps> = ({ dj, setDj }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadSuccess(false);
            setSelectedFile(file);
            // Create a preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setUploadSuccess(false);

        try {
            const uploadResult = await simulateCloudinaryUpload(selectedFile);
            const newImageUrl = uploadResult.secure_url;

            // Update the parent component's state
            setDj(prevDj => prevDj ? { ...prevDj, profileImage: newImageUrl } : null);

            setUploadSuccess(true);
            setSelectedFile(null);
            setPreviewUrl(null);
        } catch (error) {
            console.error("Upload failed:", error);
            // Handle error state if needed
        } finally {
            setIsUploading(false);
        }
    };


    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
            <div className="bg-brand-dark p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-brand-cyan mb-4">Profile Picture</h3>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                     <img 
                        src={previewUrl || dj.profileImage} 
                        alt="Profile" 
                        className="w-40 h-40 rounded-full object-cover ring-4 ring-brand-violet"
                    />
                    <div className="flex-grow">
                         <input 
                            type="file" 
                            id="profile-image-upload" 
                            accept="image/png, image/jpeg" 
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <label 
                            htmlFor="profile-image-upload"
                            className="cursor-pointer bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300"
                        >
                            Choose Image...
                        </label>
                        {selectedFile && <p className="text-sm text-gray-400 mt-2">Selected: {selectedFile.name}</p>}
                    </div>
                </div>
                 <div className="mt-6 text-right">
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading}
                        className="bg-gradient-to-r from-brand-violet to-brand-cyan text-white font-bold py-2 px-6 rounded-full hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[180px]"
                    >
                        {isUploading ? (
                            <>
                                <LoaderIcon className="w-5 h-5" />
                                <span className="ml-2">Uploading...</span>
                            </>
                        ) : (
                            'Save Profile Image'
                        )}
                    </button>
                </div>
                {uploadSuccess && (
                    <div className="mt-4 flex items-center gap-2 text-green-400">
                        <CheckCircleIcon className="w-6 h-6" />
                        <p>Profile image updated successfully!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileEditSection;