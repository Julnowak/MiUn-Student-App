import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Typography,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box
} from '@mui/material';
import { AccountCircle, Comment } from '@mui/icons-material';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [filter, setFilter] = useState({ field: 'content', value: '' });
  const [comments, setComments] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const handlePostSubmit = () => {
    if (newPost.trim()) {
      const post = {
        id: Date.now(),
        author: 'Current User',
        content: newPost,
        timestamp: new Date().toLocaleString(),
        comments: []
      };
      setPosts([post, ...posts]);
      setNewPost('');
      setCurrentPage(1); // Reset to first page after new post
    }
  };

  const handleCommentSubmit = (postId) => {
    if (comments[postId]?.trim()) {
      const comment = {
        id: Date.now(),
        author: 'Current User',
        content: comments[postId],
        timestamp: new Date().toLocaleString()
      };
      setPosts(posts.map(post =>
        post.id === postId
          ? {...post, comments: [...post.comments, comment]}
          : post
      ));
      setComments({...comments, [postId]: ''});
    }
  };

  const filteredPosts = posts.filter(post =>
    post[filter.field].toLowerCase().includes(filter.value.toLowerCase())
  );

  // Pagination calculations
  const pageCount = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (field, value) => {
    setFilter({ ...filter, [field]: value });
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Filter by</InputLabel>
          <Select
            value={filter.field}
            label="Filter by"
            onChange={(e) => handleFilterChange('field', e.target.value)}
          >
            <MenuItem value="content">Content</MenuItem>
            <MenuItem value="author">Author</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label={`Filter by ${filter.field}`}
          variant="outlined"
          value={filter.value}
          onChange={(e) => handleFilterChange('value', e.target.value)}
        />
      </Box>

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Create a new post"
        variant="outlined"
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handlePostSubmit}
        sx={{ mb: 4 }}
      >
        Post
      </Button>

      <List>
        {paginatedPosts.map(post => (
          <Card key={post.id} sx={{ mb: 3 }}>
            <CardHeader
              avatar={<Avatar><AccountCircle /></Avatar>}
              title={post.author}
              subheader={post.timestamp}
            />
            <CardContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {post.content}
              </Typography>
              <Divider sx={{ my: 2 }} />

              <List>
                {post.comments.map(comment => (
                  <ListItem key={comment.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 24, height: 24 }}>
                        <Comment fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={comment.author}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            {comment.content}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {comment.timestamp}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              <TextField
                fullWidth
                variant="outlined"
                label="Write a comment"
                value={comments[post.id] || ''}
                onChange={(e) => setComments({
                  ...comments,
                  [post.id]: e.target.value
                })}
                sx={{ mt: 2 }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit(post.id);
                  }
                }}
              />
              <Button
                variant="text"
                size="small"
                onClick={() => handleCommentSubmit(post.id)}
                sx={{ mt: 1 }}
              >
                Comment
              </Button>
            </CardContent>
          </Card>
        ))}
      </List>

      {filteredPosts.length > itemsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pageCount}
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
};

export default Forum;