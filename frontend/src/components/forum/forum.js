import React, {useState, useEffect, useRef} from 'react';
import {
    Box, Card, CardContent, CardHeader, Avatar, Typography, TextField, Button,
    IconButton, MenuItem, Select, FormControl, InputLabel, Dialog,
    DialogContent, useMediaQuery, Link
} from '@mui/material';
import {
    Comment, ThumbUp, ThumbDown, Close, SentimentSatisfiedAlt, Image,
    MoreHoriz, Share, Send, Search
} from '@mui/icons-material';
import {useTheme, styled, alpha} from '@mui/material/styles';
import {motion} from 'framer-motion';
import client from "../../client";
import {API_BASE_URL} from "../../config";
import EmojiPicker from 'emoji-picker-react';
import {useNavigate} from "react-router-dom";

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

    const token = localStorage.getItem("access")
    useEffect(() => {
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

        if (token) {
            fetchGroupData();
        }
    }, [token]); // Remove 'posts' from dependencies to avoid infinite loop

    const filteredPosts = posts.filter(post => {
        const matchesGroup = selectedGroup === 'all' || post.groupId === Number(selectedGroup);
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesGroup && matchesSearch;
    });


    const handleAddPost = async () => {
        if (!title.trim() || !content.trim() || !groupId) return;


        try {
            const response = await client.post(API_BASE_URL + "forum/", {
                group_id: groupId,
                title: title,
                content: content
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                }
            });

            const newPost = response.data
            console.log(newPost)
            setPosts([newPost, ...posts]);
            setIsComposerOpen(false);
            setImages([]);
            setImagePreviews([]);
            setTitle('');
            setContent('');
            setGroupId('');
        } catch (err) {
            console.error("Błąd przy dodawaniu zasobu:", err);
        }
    };

    const handleLike = (postId) => {
        setPosts(posts.map(post => {
            if (post.id !== postId) return post;

            // Jeśli użytkownik już polubił, to usuń like
            if (post.userLiked) {
                return {
                    ...post,
                    likes: post.likes - 1,
                    userLiked: false
                };
            }
            // Jeśli użytkownik już nie lubił, to usuń dislike i dodaj like
            else if (post.userDisliked) {
                return {
                    ...post,
                    likes: post.likes + 1,
                    dislikes: post.dislikes - 1,
                    userLiked: true,
                    userDisliked: false
                };
            }
            // Jeśli nie było reakcji, dodaj like
            else {
                return {
                    ...post,
                    likes: post.likes + 1,
                    userLiked: true
                };
            }
        }));
    };

    const handleDislike = (postId) => {
        setPosts(posts.map(post => {
            if (post.id !== postId) return post;

            // Jeśli użytkownik już nie lubił, to usuń dislike
            if (post.userDisliked) {
                return {
                    ...post,
                    dislikes: post.dislikes - 1,
                    userDisliked: false
                };
            }
            // Jeśli użytkownik już polubił, to usuń like i dodaj dislike
            else if (post.userLiked) {
                return {
                    ...post,
                    likes: post.likes - 1,
                    dislikes: post.dislikes + 1,
                    userLiked: false,
                    userDisliked: true
                };
            }
            // Jeśli nie było reakcji, dodaj dislike
            else {
                return {
                    ...post,
                    dislikes: post.dislikes + 1,
                    userDisliked: true
                };
            }
        }));
    };

    const handleAddComment = (postId) => {
        if (!commentText.trim()) return;

        const updatedPosts = posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    comments: [...post.comments, {
                        id: post.comments?.length + 1,
                        author: 'Current User',
                        authorAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
                        content: commentText,
                        timestamp: new Date().toISOString()
                    }]
                };
            }
            return post;
        });

        setPosts(updatedPosts);
        setCommentText('');
        setActiveCommentPost(null);
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

            {/* Posts */}
            {filteredPosts.map(post => (
                <motion.div
                    key={post.id}
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.3}}
                >
                    <PostCard>
                        <CardHeader
                            avatar={<Avatar src={post.author.profile_picture?.slice(15)}/>}
                            action={
                                <IconButton>
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
  style={{ textDecoration: 'none', color: 'inherit', position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
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
                                            src={src}
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
                                    onClick={() => handleLike(post.id)}
                                >
                                    {post.likes}
                                </ActionButton>
                                <ActionButton
                                    startIcon={<ThumbDown color={post.userDisliked ? 'error' : 'inherit'}/>}
                                    onClick={() => handleDislike(post.id)}
                                >
                                    {post.dislikes}
                                </ActionButton>
                                <ActionButton
                                    startIcon={<Comment/>}
                                    onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                                >
                                    {post.comments?.length}
                                </ActionButton>
                                <ActionButton startIcon={<Share/>}>
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
                                                <Avatar src={comment.authorAvatar} sx={{width: 32, height: 32}}/>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {comment.author}
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