import React, { useEffect, useState, useRef } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import emailjs from '@emailjs/browser';

function FetchData() {
  const [records, setRecords] = useState([]);
  const [replyForms, setReplyForms] = useState({});
  const [commentId, setcommentId] = useState('');
  const [namec, setnamec] = useState('');
  const [comment, setcomment] = useState('');
  const [emailid, setemailid] = useState('');
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetch('https://comments-vgwd.onrender.com/comments')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setRecords(data))
      .catch(err => console.error('Fetch error:', err));
  }, []);

  const handleReplyClick = (commentId) => {
    setReplyForms(prevState => ({
      ...prevState,
      [commentId]: true,
    }));
  };

  const handleReplySubmit = async (commentId, replyText) => {
    try {
      const originalComment = records.find(comment => comment.id === commentId);

      setnamec(originalComment.name);
      setcomment(originalComment.comment);
      setemailid(originalComment.emailid);

      const response = await fetch('https://getreplies.onrender.com/getreplies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId: commentId,
          namec: originalComment.name,
          comment: originalComment.comment,
          emailid: originalComment.emailid,
          replyText: replyText,
        }),
      });

      if (response.ok) {
        toast.success('Reply submitted successfully!', {
          position: toast.POSITION.BOTTOM_CENTER,
        });

        setRecords((prevRecords) => prevRecords.filter(comment => comment.id !== commentId));
        setReplyText('');
      } else {
        toast.error('Failed to submit reply.');
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setnamec('');
      setcomment('');
      setemailid('');
      setReplyForms((prevState) => ({
        ...prevState,
        [commentId]: false,
      }));
    }
  };

  useEffect(() => {
    console.log('Name:', namec);
    console.log('Comment:', comment);
    console.log('Email:', emailid);
  }, [namec, comment, emailid]);

  return (
    <div>
      {records.map((comment, index) => (
        <div key={index} style={{ marginBottom: '16px', backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div" name="user_name">
                {comment.name}
              </Typography>
              <Typography color="text.secondary">
                {comment.comment}
              </Typography>
              <Typography color="text.secondary" name="user_email">
                Email: {comment.emailid}
              </Typography>
              {replyForms[comment.id] ? (
                <div>
                  <TextareaAutosize
                    aria-label="Reply"
                    placeholder="Type your reply here..."
                    style={{ width: '100%', marginTop: '8px' }}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    name="message"
                  />

                  <Button
                    variant="contained"
                    color="primary"
                    style={{ marginTop: '8px' }}
                    onClick={() => handleReplySubmit(comment.id, replyText)}
                    type="submit"
                  >
                    Submit
                  </Button>
                </div>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  style={{ marginTop: '8px' }}
                  onClick={() => handleReplyClick(comment.id)}
                >
                  Reply
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
      <ToastContainer />
    </div>
  );
}

export default FetchData;
