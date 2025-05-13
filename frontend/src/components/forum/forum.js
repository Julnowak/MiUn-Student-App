import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Typography,
  TextField,
  Button,
  Chip,
  IconButton,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useMediaQuery, Box
} from '@mui/material';
import {
  Comment,
  FilterList,
  Search,
  AddCircle,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Mock danych
const mockGroups = [
  { id: 1, name: 'React Developers', color: '#2196f3' },
  { id: 2, name: 'UI/UX Design', color: '#9c27b0' },
  { id: 3, name: 'Backend Masters', color: '#4caf50' },
];

const mockPosts = [
  {
    id: 1,
    groupId: 1,
    title: 'Problem z komponentem Suspense',
    author: 'Jan Kowalski',
    content: 'Jak prawidłowo implementować ładowanie danych z API przy użyciu Suspense?',
    timestamp: '2023-08-15 14:30',
    comments: [
      { id: 1, author: 'Anna Nowak', content: 'Użyj React Query', timestamp: '2023-08-15 15:00' },
      { id: 2, author: 'Piotr Wiśniewski', content: 'Spróbuj z SWR', timestamp: '2023-08-15 15:30' }
    ],
    likes: 5,
    dislikes: 1
  },
  // ... więcej postów
];


const PostComposer = ({ onAddPost, groups }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [groupId, setGroupId] = useState('');

  const handlePost = () => {
    if (!title.trim() || !content.trim() || !groupId) return;

    onAddPost({
      id: Date.now(),
      groupId: Number(groupId),
      title,
      author: 'Current User',
      content,
      timestamp: new Date().toISOString(),
      comments: [],
      likes: 0,
      dislikes: 0,
    });

    setTitle('');
    setContent('');
    setGroupId('');
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        avatar={<Avatar sx={{ bgcolor: '#1976d2' }}>U</Avatar>}
        title="Utwórz nowy post"
      />
      <CardContent>
        <TextField
          label="Tytuł posta"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Grupa</InputLabel>
          <Select value={groupId} onChange={(e) => setGroupId(e.target.value)} label="Grupa">
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Co masz na myśli?"
          multiline
          minRows={3}
          fullWidth
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          startIcon={<AddCircle />}
          onClick={handlePost}
        >
          Opublikuj
        </Button>
      </CardContent>
    </Card>
  );
};


const Forum = ({ userId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [posts, setPosts] = useState(mockPosts);

  // Filtrowanie postów
  const filteredPosts = posts.filter(post => {
    const matchesGroup = selectedGroup === 'all' || post.groupId === Number(selectedGroup);
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const handleAddPost = (newPost) => {
  setPosts([newPost, ...posts]);
};

  const handleAddComment = (postId) => {
    if (!newComment.trim()) return;

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, {
            id: post.comments.length + 1,
            author: 'Current User',
            content: newComment,
            timestamp: new Date().toISOString()
          }]
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    setNewComment('');
  };

  const PostCard = ({ post }) => (
    <Card sx={{ mb: 2, cursor: 'pointer' }} onClick={() => setSelectedPost(post)}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: mockGroups.find(g => g.id === post.groupId)?.color }}>
            {post.groupId}
          </Avatar>
        }
        title={post.title}
        subheader={
          <>
            <Chip
              label={mockGroups.find(g => g.id === post.groupId)?.name}
              size="small"
              sx={{ mr: 1 }}
            />
            {post.author} • {new Date(post.timestamp).toLocaleDateString()}
          </>
        }
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {post.content.substring(0, 100)}...
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <IconButton size="small">
            <ThumbUp fontSize="small" />
            <Typography variant="body2" sx={{ ml: 0.5 }}>{post.likes}</Typography>
          </IconButton>
          <IconButton size="small" sx={{ ml: 1 }}>
            <ThumbDown fontSize="small" />
            <Typography variant="body2" sx={{ ml: 0.5 }}>{post.dislikes}</Typography>
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Chip
            icon={<Comment />}
            label={post.comments.length}
            size="small"
            color="primary"
          />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={3} sx={{ p: 3 }}>
      {/* Filtry i wyszukiwanie */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filtruj grupę</InputLabel>
            <Select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              label="Filtruj grupę"
            >
              <MenuItem value="all">Wszystkie grupy</MenuItem>
              {mockGroups.map(group => (
                <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Szukaj w tematach"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: <Search /> }}
            sx={{ flexGrow: 1 }}
          />
        </Box>
      </Grid>

      {/* Lista postów */}
      <Grid item xs={12} md={selectedPost && !isMobile ? 6 : 12}>
        {filteredPosts.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <FilterList sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6">Brak postów spełniających kryteria</Typography>
          </Box>
        ) : (
          filteredPosts.map(post => <PostCard key={post.id} post={post} />)
        )}
      </Grid>

      <PostComposer onAddPost={handleAddPost} groups={mockGroups} />

      {/* Szczegóły postu */}
      {selectedPost && (
        <Grid item xs={12} md={6}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardHeader
              title={selectedPost.title}
              subheader={
                <>
                  <Typography variant="subtitle2">
                    {mockGroups.find(g => g.id === selectedPost.groupId)?.name}
                  </Typography>
                  <Typography variant="caption">
                    {selectedPost.author} • {new Date(selectedPost.timestamp).toLocaleString()}
                  </Typography>
                </>
              }
            />
            <CardContent>
              <Typography paragraph>{selectedPost.content}</Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Komentarze ({selectedPost.comments.length})
              </Typography>

              {selectedPost.comments.map(comment => (
                <Box key={comment.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">{comment.author}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(comment.timestamp).toLocaleDateString()}
                  </Typography>
                  <Typography paragraph sx={{ mt: 0.5 }}>
                    {comment.content}
                  </Typography>
                </Box>
              ))}

              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Dodaj komentarz"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                  variant="contained"
                  startIcon={<AddCircle />}
                  sx={{ mt: 1 }}
                  onClick={() => handleAddComment(selectedPost.id)}
                >
                  Dodaj komentarz
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

export default Forum;