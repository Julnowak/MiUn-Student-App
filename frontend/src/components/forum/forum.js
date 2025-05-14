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
  useMediaQuery,
  Box,
  Dialog,
  DialogContent,
  Fab,
  Badge
} from '@mui/material';
import {
  Comment,
  FilterList,
  Search,
  Add,
  ThumbUp,
  ThumbDown,
  Close,
  SentimentSatisfiedAlt,
  Image
} from '@mui/icons-material';
import { useTheme, styled, alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';


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

// Stylizowane komponenty
const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)}, ${theme.palette.background.paper})`,
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  boxShadow: theme.shadows[4],
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8]
  }
}));

const StyledChip = styled(Chip)(({ theme, groupcolor }) => ({
  backgroundColor: alpha(groupcolor || theme.palette.primary.main, 0.1),
  color: groupcolor || theme.palette.primary.main,
  fontWeight: 600,
  borderRadius: '8px',
  '& .MuiChip-label': {
    padding: '0 8px'
  }
}));

// Mock danych pozostaje bez zmian

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
    <GradientCard sx={{ mb: 3, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>U</Avatar>
        <Typography variant="subtitle1" color="text.secondary">
          Co chcesz udostępnić?
        </Typography>
      </Box>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Wybierz grupę</InputLabel>
        <Select
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          variant="outlined"
          MenuProps={{
            PaperProps: {
              sx: {
                borderRadius: '12px',
                marginTop: 1
              }
            }
          }}
        >
          {groups.map((group) => (
            <MenuItem key={group.id} value={group.id}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{
                  width: 12,
                  height: 12,
                  bgcolor: group.color,
                  borderRadius: '4px',
                  mr: 1.5
                }} />
                {group.name}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Tytuł posta"
        variant="outlined"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        multiline
        minRows={3}
        variant="outlined"
        placeholder="Opisz szczegóły..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        InputProps={{
          endAdornment: (
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <IconButton>
                <SentimentSatisfiedAlt fontSize="small" />
              </IconButton>
              <IconButton>
                <Image fontSize="small" />
              </IconButton>
            </Box>
          )
        }}
      />

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2, py: 1.5, borderRadius: '12px' }}
        onClick={handlePost}
      >
        Opublikuj
      </Button>
    </GradientCard>
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

  // Reszta logiki pozostaje podobna, z modyfikacjami wizualnymi

  const PostCard = ({ post }) => {
    const group = mockGroups.find(g => g.id === post.groupId);
    return (
      <GradientCard>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{
              width: 6,
              height: 40,
              bgcolor: group.color,
              borderRadius: '4px',
              mr: 2
            }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {post.title}
            </Typography>
            <StyledChip
              label={group.name}
              groupcolor={group.color}
              size="small"
            />
          </Box>

          <Typography variant="body2" color="text.secondary" paragraph>
            {post.content}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ThumbUp />}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              {post.likes}
            </Button>
            <Button
              startIcon={<Comment />}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              {post.comments.length}
            </Button>
            <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto' }}>
              {new Date(post.timestamp).toLocaleDateString()}
            </Typography>
          </Box>
        </CardContent>
      </GradientCard>
    );
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1280, margin: '0 auto' }}>
      <Box sx={{
        display: 'flex',
        gap: 2,
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' }
      }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Szukaj w postach..."
          InputProps={{
            startAdornment: <Search sx={{ color: 'text.disabled', mr: 1 }} />,
            sx: { borderRadius: '12px' }
          }}
        />

        <Select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          variant="outlined"
          sx={{
            minWidth: 200,
            '.MuiSelect-select': { py: 1.25 },
            borderRadius: '12px'
          }}
        >
          <MenuItem value="all">Wszystkie grupy</MenuItem>
          {mockGroups.map(group => (
            <MenuItem key={group.id} value={group.id}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{
                  width: 8,
                  height: 8,
                  bgcolor: group.color,
                  borderRadius: '50%',
                  mr: 1.5
                }} />
                {group.name}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </Box>

      <PostComposer onAddPost={handleAddPost} groups={mockGroups} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {filteredPosts.map(post => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ mb: 3 }}>
                <PostCard post={post} />
              </Box>
            </motion.div>
          ))}
        </Grid>
      </Grid>

      {/* Modal dla szczegółów postu na mobile */}
      <Dialog
        fullScreen={isMobile}
        open={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : '16px' } }}
      >
        {/* Reszta implementacji szczegółów postu */}
      </Dialog>

      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          display: { xs: 'flex', md: 'none' }
        }}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default Forum;