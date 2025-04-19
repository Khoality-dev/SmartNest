import React, { useEffect } from 'react';
import { Button, Typography } from '@mui/material';

const FileUploadButton = ({ deviceIndex, setSelectedFile }) => {
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };


    return (
        <>
            <input
                accept=".mp3"
                style={{ display: 'none' }}
                id={`file-upload-${deviceIndex}`}
                type="file"
                onChange={handleFileChange}
            />
            <label htmlFor={`file-upload-${deviceIndex}`}>
                <Button variant="contained" component="span">
                    Chon file nhac
                </Button>
            </label>
        </>
    );
};

export default FileUploadButton;