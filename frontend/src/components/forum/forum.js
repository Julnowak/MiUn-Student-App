import React, {useState, useEffect, useRef} from 'react';
import {
    Box, Card, CardContent, CardHeader, Avatar, Typography, TextField, Button,
    IconButton, MenuItem, Select, FormControl, InputLabel, Dialog,
    DialogContent, useMediaQuery, Link, DialogTitle, DialogActions, Pagination
} from '@mui/material';
import {
    Comment, ThumbUp, ThumbDown, Close, SentimentSatisfiedAlt, Image,
    MoreHoriz, Share, Send, Search, Delete, Instagram, Facebook
} from '@mui/icons-material';
import {useTheme, styled, alpha} from '@mui/material/styles';
import {motion} from 'framer-motion';
import client from "../../client";
import {API_BASE_URL} from "../../config";
import EmojiPicker from 'emoji-picker-react';
import {useNavigate} from "react-router-dom";
import LinkIcon from "@mui/icons-material/Link";

// Stylizowane komponenty
const PostCard = styled(Card)(({theme}) => ({
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: theme.spacing(3),
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }
}));

const ActionButton = styled(Button)(({theme}) => ({
    color: theme.palette.text.secondary,
    fontWeight: 500,
    textTransform: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.05)
    }
}));

const CommentInput = styled(TextField)(({theme}) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '20px',
        backgroundColor: theme.palette.mode === 'light' ? '#f0f2f5' : '#3a3b3c'
    }
}));


const Forum = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [selectedGroup, setSelectedGroup] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [groups, setGroups] = useState([]);
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [groupId, setGroupId] = useState('');
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeCommentPost, setActiveCommentPost] = useState(null);
    const [commentText, setCommentText] = useState('');
    const emojiPickerRef = useRef();
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage] = useState(5); // Liczba postów na stronę

    const token = localStorage.getItem("access")
const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [currentPost, setCurrentPost] = useState(null);
    const [shareUrl, setShareUrl] = useState('');

    // Funkcja do udostępniania posta
    const handleSharePost = (post) => {
        setCurrentPost(post);
        setShareUrl(`${window.location.origin}/post/${post.id}`);
        setIsShareDialogOpen(true);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl)
            .then(() => alert('Link skopiowany do schowka!'))
            .catch(() => alert('Błąd kopiowania'));
        setIsShareDialogOpen(false);
    };

    // Funkcja do otwierania edycji posta
    const handleEditPost = (post) => {
        setCurrentPost(post);
        setTitle(post.title);
        setContent(post.content);
        setGroupId(post.group.id);
        setIsEditDialogOpen(true);
    };

    // Funkcja do zapisywania edytowanego posta
    const handleSaveEditedPost = async () => {
        try {
            const response = await client.put(API_BASE_URL + `forum/`, {
                group_id: groupId,
                title: title,
                content: content,
                post_id: currentPost.id
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const updatedPosts = posts.map(post =>
                post.id === currentPost.id ? response.data : post
            );

            setPosts(updatedPosts);
            setIsEditDialogOpen(false);
            setCurrentPost(null);
        } catch (err) {
            console.error("Błąd przy edycji posta:", err);
        }
    };

        const filteredPosts = posts.filter(post => {
        const matchesGroup = selectedGroup === 'all' || post.group.id === Number(selectedGroup);
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesGroup && matchesSearch;
    });

     const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

     useEffect(() => {
        setCurrentPage(1);
    }, [selectedGroup, searchQuery]);

    // Funkcja do usuwania posta
    const handleDeletePost = async (postId) => {
        if (window.confirm('Czy na pewno chcesz usunąć ten post?')) {
            try {
                await client.delete(API_BASE_URL + `forum/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        post_id: postId
                    }
                });

                setPosts(posts.filter(post => post.id !== postId));
            } catch (err) {
                console.error("Błąd przy usuwaniu posta:", err);
            }
        }
    };


    const fetchGroupData = async () => {
        try {
            const response = await client.get(API_BASE_URL + "forum/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data.posts);
            setGroups(response.data.groups);
            setPosts(response.data.posts); // Add this line to set the posts from API
        } catch (error) {
            console.log("Nie udało się zalogować");
        }
    };


    useEffect(() => {

        if (token) {
            fetchGroupData();
        }
    }, [token]); // Remove 'posts' from dependencies to avoid infinite loop




    const handleAddPost = async () => {
  if (!title.trim() || !content.trim() || !groupId) return;

  try {
    // 1. Create FormData object
    const formData = new FormData();

    // 2. Append regular fields
    formData.append('group_id', groupId);
    formData.append('title', title);
    formData.append('content', content);

    // 3. Convert and append images
    for (let i = 0; i < imagePreviews.length; i++) {
      const blobUrl = imagePreviews[i];

      // Fetch the blob URL
      const response = await fetch(blobUrl);
      const blob = await response.blob();

      // Create a File object with a proper name
      const file = new File([blob], `image-${Date.now()}-${i}.jpeg`, { type: blob.type });

      // Append to FormData (use 'images' as key for Django to recognize multiple files)
      formData.append('images', file);
    }

    // 4. Send the request with FormData
    const response = await client.post(API_BASE_URL + "forum/", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        // Let the browser set the Content-Type with boundary automatically
        'Content-Type': 'multipart/form-data',
      }
    });

    const newPost = response.data;
    setPosts([newPost, ...posts]);
    setIsComposerOpen(false);
    setImages([]);
    setImagePreviews([]);
    setTitle('');
    setContent('');
    setGroupId('');
  } catch (err) {
    console.error("Error adding post:", err);
  }
};

    const handleLikeDislike = async (postId, like_type, content_type) => {

        try {
            const response = await client.post(API_BASE_URL + "like_dislike/", {
                type: like_type,
                content_type: content_type,
                post_id: postId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                }
            });

        } catch (err) {
            console.error("Błąd przy dodawaniu zasobu:", err);
        }
        fetchGroupData();
    };


    const handleAddComment = async (postId) => {
        if (!commentText.trim()) return;

        try {
            const response = await client.post(API_BASE_URL + `comment/${postId}/`, {
                content: commentText
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                }
            });

            const updatedPosts = posts.map(post => {
                if (post.id === postId) {
                    return response.data
                }
                return post;
            });

            setPosts(updatedPosts);
            setCommentText('');
            setActiveCommentPost(null);

        } catch (err) {
            console.error("Błąd przy dodawaniu zasobu:", err);
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);

        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    };



    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Box sx={{p: {xs: 1, sm: 3}, maxWidth: 800, margin: '0 auto'}}>
            {/* Composer Button */}
            <Card sx={{mb: 3, borderRadius: '12px'}}>
                <CardContent sx={{display: 'flex', alignItems: 'center'}}>
                    <Avatar sx={{mr: 2}}/>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => setIsComposerOpen(true)}
                        sx={{
                            justifyContent: 'flex-start',
                            borderRadius: '20px',
                            textTransform: 'none',
                            color: 'text.secondary',
                            bgcolor: theme.palette.mode === 'light' ? '#f0f2f5' : '#3a3b3c'
                        }}
                    >
                        Co chcesz opublikować?
                    </Button>
                </CardContent>
            </Card>

            {/* Filters */}
            <Box sx={{display: 'flex', gap: 2, mb: 3, flexDirection: {xs: 'column', sm: 'row'}}}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Szukaj w postach..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: <Search sx={{color: 'text.disabled', mr: 1}}/>,
                        sx: {borderRadius: '20px'}
                    }}
                />

                <FormControl sx={{minWidth: 200}}>
                    <InputLabel>Grupa</InputLabel>
                    <Select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        label="Grupa"
                        sx={{borderRadius: '20px'}}
                    >
                        <MenuItem value="all">Wszystkie grupy</MenuItem>
                        {groups.map(group => (
                            <MenuItem key={group.id} value={group.id}>
                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                    <Box sx={{
                                        width: 8,
                                        height: 8,
                                        bgcolor: group.color,
                                        borderRadius: '50%',
                                        mr: 1.5
                                    }}/>
                                    {group.name}
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

                        {/* Dialog udostępniania */}
<Dialog open={isShareDialogOpen} onClose={() => setIsShareDialogOpen(false)}>
    <DialogTitle>Udostępnij post</DialogTitle>
    <DialogContent>
        <Typography variant="body1" sx={{mb: 2}}>
            Udostępnij ten post poprzez:
        </Typography>
        <Box sx={{textAlign: "center", display: 'flex', flexDirection: 'column', gap: 1}}>
            <Button
                variant="outlined"
                onClick={copyToClipboard}
                startIcon={<LinkIcon />}
                sx={{justifyContent: 'flex-start'}}
            >
                Kopiuj link
            </Button>

            {/* Przycisk udostępniania na Facebook */}
            <Button
                variant="contained"
                sx={{
                    justifyContent: 'flex-start',
                    backgroundColor: '#1877F2',
                    color: 'white',
                    '&:hover': { backgroundColor: '#166FE5' }
                }}
                startIcon={<Facebook />}
                onClick={() => {
                    window.open(
                        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                        '_blank',
                        'width=600,height=400'
                    );
                }}
            >
                Udostępnij na Facebooku
            </Button>

            {/* Przycisk udostępniania na Instagram */}
            <Button
                variant="contained"
                sx={{
                    justifyContent: 'flex-start',
                    background: 'linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)',
                    color: 'white',
                    '&:hover': { opacity: 0.9 }
                }}
                startIcon={<Instagram />}
                onClick={() => {
                    // Instagram nie ma oficjalnego API do udostępniania, więc otwieramy nową zakładkę
                    window.open('https://www.instagram.com/', '_blank');
                    // Można dodać informację dla użytkownika
                    alert('Skopiuj link i wklej go w swoim poście na Instagramie');
                    copyToClipboard();
                }}
            >
                Udostępnij na Instagramie
            </Button>
        </Box>
    </DialogContent>
    <DialogActions>
        <Button onClick={() => setIsShareDialogOpen(false)}>Anuluj</Button>
    </DialogActions>
</Dialog>

            {/* Dialog edycji posta */}
            <Dialog
                open={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Edytuj post</DialogTitle>
                <DialogContent sx={{p: 3}}>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        <FormControl fullWidth sx={{mt: 2}}>
                            <InputLabel>Grupa</InputLabel>
                            <Select
                                value={groupId}
                                label="Grupa"
                                onChange={(e) => setGroupId(e.target.value)}
                                required
                            >
                                {groups.map(group => (
                                    <MenuItem key={group.id} value={group.id}>
                                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                                            <Box sx={{
                                                width: 8,
                                                height: 8,
                                                bgcolor: group.color,
                                                borderRadius: '50%',
                                                mr: 1.5
                                            }}/>
                                            {group.name}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Tytuł"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Treść posta"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            fullWidth
                            multiline
                            minRows={4}
                        />

                        <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 2}}>
                            <Button
                                color="error"
                                startIcon={<Delete/>}
                                onClick={() => {
                                    setIsEditDialogOpen(false);
                                    handleDeletePost(currentPost.id);
                                }}
                            >
                                Usuń
                            </Button>
                            <Box sx={{display: 'flex', gap: 2}}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setIsEditDialogOpen(false)}
                                >
                                    Anuluj
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleSaveEditedPost}
                                    disabled={!title.trim() || !content.trim() || !groupId}
                                >
                                    Zapisz
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Posts */}
            {currentPosts.map(post => (
                <motion.div
                    key={post.id}
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.3}}
                >
                    <PostCard>
                        <CardHeader
                            avatar={<Avatar src={post.author.profile_picture?.slice(47)}/>}
                            action={
                                <IconButton onClick={(e) => {handleEditPost(post);
                                }}>
                                    <MoreHoriz/>
                                </IconButton>
                            }
                            title={
                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                    <Typography variant="subtitle1" component="span">
                                        {post.author.username}
                                    </Typography>
                                    <Typography variant="subtitle1" component="span" sx={{mx: 0.5}}>
                                        ➤
                                    </Typography>
                                    <Link
                                        to={`/group/${post.group.id}`}
                                        style={{
                                            textDecoration: 'none',
                                            color: 'inherit',
                                            position: 'relative',
                                            zIndex: 10,
                                            pointerEvents: 'auto'
                                        }}
                                        onClick={() => navigate(`/group/${post.group.id}`)}
                                    >
                                        {post.group.name}
                                    </Link>
                                </Box>
                            }
                            subheader={formatDate(post.timestamp)}
                            titleTypographyProps={{component: 'div'}}
                            subheaderTypographyProps={{variant: 'caption'}}
                        />

                        <CardContent sx={{pt: 0}}>
                            <Typography variant="h6" gutterBottom>
                                {post.title}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {post.content}
                            </Typography>

                            {/* Post Images */}
                            {post.images && post.images?.length > 0 && (
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: post.images?.length === 1 ? '1fr' : '1fr 1fr',
                                    gap: 1,
                                    mb: 2,
                                    borderRadius: '8px',
                                    overflow: 'hidden'
                                }}>
                                    {post.images.map((src, idx) => (
                                        <img
                                            key={idx}
                                            src={src.file.slice(48)}
                                            alt={`post-${post.id}-img-${idx}`}
                                            style={{
                                                width: '100%',
                                                height: 'auto',
                                                maxHeight: '400px',
                                                objectFit: 'cover',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    ))}
                                </Box>
                            )}

                            {/* Post Actions */}
                            <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 2}}>
                                <ActionButton
                                    startIcon={<ThumbUp color={post.userLiked ? 'primary' : 'inherit'}/>}
                                    onClick={() => handleLikeDislike(post.id, "like", "post")}
                                >
                                    {post.likes_count}
                                </ActionButton>
                                <ActionButton
                                    startIcon={<ThumbDown color={post.userDisliked ? 'error' : 'inherit'}/>}
                                    onClick={() => handleLikeDislike(post.id, "dislike", "post")}
                                >
                                    {post.dislikes_count}
                                </ActionButton>
                                <ActionButton
                                    startIcon={<Comment/>}
                                    onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                                >
                                    {post.comments?.length}
                                </ActionButton>
                                        <ActionButton
                                            startIcon={<Share/>}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSharePost(post);
                                            }}
                                        >
                                            Udostępnij
                                        </ActionButton>
                            </Box>

                            {/* Comments Section */}
                            {post.comments?.length > 0 && (
                                <Box sx={{
                                    mt: 2,
                                    bgcolor: theme.palette.mode === 'light' ? '#f7f8fa' : '#242526',
                                    borderRadius: '8px',
                                    p: 2
                                }}>
                                    {post.comments?.slice(0, 3).map(comment => (
                                        <Box key={comment.id} sx={{mb: 2}}>
                                            <Box sx={{display: 'flex', gap: 1}}>
                                                <Avatar src={comment.author.profile_picture?.slice(47)} sx={{width: 32, height: 32}}/>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {comment.author.username}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {comment.content}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    ))}

                                    {post.comments.length > 3 && (
                                        <Typography variant="body2" color="text.secondary" sx={{ml: 6}}>
                                            Pokaż więcej komentarzy ({post.comments.length - 3})
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {/* Comment Input */}
                            {activeCommentPost === post.id && (
                                <Box sx={{display: 'flex', gap: 1, mt: 2, position: 'relative'}}>
                                    <Avatar sx={{width: 32, height: 32}}/>
                                    <Box sx={{flexGrow: 1, position: 'relative'}}>
                                        <CommentInput
                                            fullWidth
                                            placeholder="Napisz komentarz..."
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            InputProps={{
                                                endAdornment: (
                                                    <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                                        <SentimentSatisfiedAlt/>
                                                    </IconButton>
                                                )
                                            }}
                                        />
                                        {showEmojiPicker && (
                                            <Box ref={emojiPickerRef}
                                                 sx={{position: 'absolute', bottom: 50, zIndex: 10}}>
                                                <EmojiPicker
                                                    onEmojiClick={(emojiData) => {
                                                        setCommentText(prev => prev + emojiData.emoji);
                                                        setShowEmojiPicker(false);
                                                    }}
                                                    width={300}
                                                    height={350}
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                    <IconButton
                                        color="primary"
                                        disabled={!commentText.trim()}
                                        onClick={() => handleAddComment(post.id)}
                                    >
                                        <Send/>
                                    </IconButton>
                                </Box>
                            )}
                        </CardContent>
                    </PostCard>
                </motion.div>
            ))}

            {filteredPosts.length > postsPerPage && (
                <Box sx={{display: 'flex', justifyContent: 'center', mt: 3}}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                borderRadius: '8px'
                            }
                        }}
                    />
                </Box>
            )}

            {/* Post Composer Dialog */}
            <Dialog
                open={isComposerOpen}
                onClose={() => setIsComposerOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent sx={{p: 3}}>
                    <Typography variant="h6" gutterBottom>
                        Utwórz post
                    </Typography>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        <FormControl fullWidth>
                            <InputLabel>Wybierz grupę</InputLabel>
                            <Select
                                value={groupId}
                                label="Wybierz grupę"
                                onChange={(e) => setGroupId(e.target.value)}
                                required
                                sx={{borderRadius: '8px'}}
                            >
                                {groups.map(group => (
                                    <MenuItem key={group.id} value={group.id}>
                                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                                            <Box sx={{
                                                width: 8,
                                                height: 8,
                                                bgcolor: group.color,
                                                borderRadius: '50%',
                                                mr: 1.5
                                            }}/>
                                            {group.name}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Tytuł"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Co chcesz opublikować?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            fullWidth
                            multiline
                            minRows={4}
                            sx={{borderRadius: '8px'}}
                        />

                        {/* Image Upload */}
                        <Box>
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<Image/>}
                                sx={{mb: 1}}
                            >
                                Dodaj zdjęcia
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    hidden
                                    onChange={handleImageUpload}
                                />
                            </Button>

                            {/* Image Previews */}
                            <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1}}>
                                {imagePreviews.map((src, idx) => (
                                    <Box key={idx} sx={{position: 'relative'}}>
                                        <img
                                            src={src}
                                            alt={`preview-${idx}`}
                                            style={{
                                                width: 80,
                                                height: 80,
                                                objectFit: 'cover',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <IconButton
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: -8,
                                                right: -8,
                                                bgcolor: 'background.paper',
                                                boxShadow: 1
                                            }}
                                            onClick={() => removeImage(idx)}
                                        >
                                            <Close fontSize="small"/>
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2}}>
                            <Button
                                variant="outlined"
                                onClick={() => setIsComposerOpen(false)}
                            >
                                Anuluj
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleAddPost}
                                disabled={!title.trim() || !content.trim() || !groupId}
                            >
                                Opublikuj
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default Forum;