import React, { useState } from 'react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

const ClipboardCopy: React.FC<{copyText:string}> = ({ copyText }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyTextToClipboard = async (text: string) => {
    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand('copy', true, text);
    }
  };

  const handleCopyClick = () => {
    // Asynchronously call copyTextToClipboard
    copyTextToClipboard(copyText)
      .then(() => {
        // If successful, update the isCopied state value
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Tooltip title={isCopied ? 'Copied!': 'Copy'}>

    <IconButton onClick={handleCopyClick}>
      <ContentCopyIcon/>
    </IconButton>
    </Tooltip>
  );
};

export default ClipboardCopy