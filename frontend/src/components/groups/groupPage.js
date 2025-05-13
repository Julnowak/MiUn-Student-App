import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  Button,
  Card,
  CardContent,
  TextField,
  IconButton,
  Divider,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useMediaQuery
} from '@mui/material';
import {
    Palette,
    Category,
    Add,
    Comment,
    People,
    Lock,
    Public,
    Edit,
    Bookmark, ThumbUp
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Mock danych
const mockGroup = {
  id: 1,
  name: 'React Advanced',
  description: 'Grupa dla zaawansowanych programistów React',
  fieldByYear: { id: 1, year: 2023, fieldName: 'Frontend' },
  admin: { id: 1, name: 'Jan Kowalski', avatar: 'J' },
  code: 'REACT2023',
  isPublic: true,
  members: [1, 2, 3],
  limit: 100,
  archived: false,
  posts: [
    {
      id: 1,
      title: 'Optymalizacja wydajności',
      content: 'Najlepsze praktyki optymalizacji komponentów...',
      author: { id: 2, name: 'Anna Nowak' },
      timestamp: '2023-08-20T14:30:00',
      color: '#f0f4ff',
      categories: [
        { name: 'Performance', color: '#4caf50' },
        { name: 'React', color: '#2196f3' }
      ],
      comments: [
        { id: 1, content: 'Używaj React.memo!', author: { id: 3, name: 'Piotr Wiśniewski' }, timestamp: '2023-08-20T15:00:00' }
      ],
      likes: 15,
      bookmarks: 8
    }
  ]
};

const GroupPage = () => {
  const { groupId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [group, setGroup] = useState(mockGroup);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    color: '#ffffff',
    categories: [],
    newCategory: { name: '', color: '#2196f3' }
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const currentUser = { id: 1, name: 'Aktualny Użytkownik' };

  const isMember = group.members.includes(currentUser.id);
  const isAdmin = group.admin.id === currentUser.id;

  const handleCreatePost = () => {
    const post = {
      id: group.posts.length + 1,
      ...newPost,
      author: currentUser,
      timestamp: new Date().toISOString(),
      comments: [],
      likes: 0,
      bookmarks: 0
    };

    setGroup(prev => ({
      ...prev,
      posts: [post, ...prev.posts]
    }));

    setNewPost({
      title: '',
      content: '',
      color: '#ffffff',
      categories: [],
      newCategory: { name: '', color: '#2196f3' }
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Nagłówek grupy */}
      <Box sx={{
        p: 4,
        mb: 4,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: theme.shadows[2]
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
          <Avatar sx={{
            bgcolor: theme.palette.primary.main,
            width: 80,
            height: 80,
            fontSize: 40
          }}>
            {group.name[0]}
          </Avatar>

          <Box>
            <Typography variant="h3" sx={{ mb: 1 }}>
              {group.name}
              {group.archived && (
                <Chip
                  label="Archiwalna"
                  color="error"
                  size="small"
                  sx={{ ml: 2, verticalAlign: 'middle' }}
                />
              )}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {group.description}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Chip
            icon={<People />}
            label={`${group.members.length}/${group.limit} członków`}
          />
          <Chip
            icon={group.isPublic ? <Public /> : <Lock />}
            label={group.isPublic ? 'Grupa publiczna' : 'Grupa prywatna'}
            color={group.isPublic ? 'success' : 'warning'}
          />
          <Chip
            icon={<Category />}
            label={group.fieldByYear.fieldName}
            avatar={<Avatar>{group.fieldByYear.year}</Avatar>}
          />
          <Chip
            icon={<Bookmark />}
            label={`Kod dostępu: ${group.code}`}
            sx={{ cursor: 'pointer' }}
            onClick={() => navigator.clipboard.writeText(group.code)}
          />
        </Box>
      </Box>

      {/* Formularz nowego postu */}
      {isMember && !group.archived && (
        <Card sx={{ mb: 4, position: 'relative' }}>
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            bgcolor: newPost.color
          }} />

          <CardContent>
            <TextField
              fullWidth
              label="Tytuł postu"
              value={newPost.title}
              onChange={e => setNewPost({ ...newPost, title: e.target.value })}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Edit />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Treść postu"
              value={newPost.content}
              onChange={e => setNewPost({ ...newPost, content: e.target.value })}
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
              <Button
                startIcon={<Palette />}
                onClick={() => setShowColorPicker(!showColorPicker)}
                sx={{ textTransform: 'none' }}
              >
                Wybierz kolor nagłówka
              </Button>

              {/*{showColorPicker && (*/}
              {/*  <ChromePicker*/}
              {/*    color={newPost.color}*/}
              {/*    onChangeComplete={color => setNewPost({ ...newPost, color: color.hex })}*/}
              {/*  />*/}
              {/*)}*/}

              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Kategorie</InputLabel>
                <Select
                  multiple
                  value={newPost.categories}
                  onChange={e => setNewPost({ ...newPost, categories: e.target.value })}
                  renderValue={selected => (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {selected.map(cat => (
                        <Chip
                          key={cat.name}
                          label={cat.name}
                          size="small"
                          sx={{ bgcolor: cat.color, color: 'white' }}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {group.posts.flatMap(p => p.categories)
                    .filter((v, i, a) => a.findIndex(t => t.name === v.name) === i)
                    .map(cat => (
                      <MenuItem key={cat.name} value={cat}>
                        <Box sx={{
                          width: 16,
                          height: 16,
                          bgcolor: cat.color,
                          mr: 1,
                          borderRadius: '4px'
                        }} />
                        {cat.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreatePost}
              disabled={!newPost.title || !newPost.content}
              fullWidth
            >
              Opublikuj post
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lista postów */}
      {group.posts.map(post => (
        <Card key={post.id} sx={{ mb: 4, position: 'relative' }}>
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            bgcolor: post.color
          }} />

          <CardContent>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {post.categories.map(cat => (
                <Chip
                  key={cat.name}
                  label={cat.name}
                  sx={{ bgcolor: cat.color, color: 'white' }}
                />
              ))}
            </Box>

            <Typography variant="h5" gutterBottom>
              {post.title}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar>{post.author.name[0]}</Avatar>
              <Box>
                <Typography>{post.author.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(post.timestamp).toLocaleDateString('pl-PL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
            </Box>

            <Typography paragraph sx={{ whiteSpace: 'pre-line' }}>
              {post.content}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <IconButton>
                <Comment />
                <Typography sx={{ ml: 1 }}>{post.comments.length}</Typography>
              </IconButton>

              <IconButton>
                <ThumbUp />
                <Typography sx={{ ml: 1 }}>{post.likes}</Typography>
              </IconButton>

              <IconButton>
                <Bookmark />
                <Typography sx={{ ml: 1 }}>{post.bookmarks}</Typography>
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default GroupPage;