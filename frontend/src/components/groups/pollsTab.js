import React, {useState} from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    LinearProgress,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Pagination,
    Tab,
    Tabs,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import {Add, Poll, Link, HowToVote, Check} from "@mui/icons-material";
import {styled, alpha} from '@mui/material/styles';

// Mock data
const initialPolls = [
    {
        id: 1,
        question: "Który framework wolisz?",
        options: [
            {id: 1, text: "React", votes: 12},
            {id: 2, text: "Vue", votes: 8},
            {id: 3, text: "Angular", votes: 5},
            {id: 4, text: "Svelte", votes: 3}
        ],
        totalVotes: 28,
        type: "local",
        voted: false
    },
    {
        id: 2,
        title: "Ukrywanie emocji",
        question: "Jak często ukrywasz emocje?",
        link: "https://forms.cloud.microsoft/e/5F5jzw6FE5",
        type: "forms",
        voted: false
    }
];

// Styled components
const PollCard = styled(Card)(({theme}) => ({
    borderRadius: '16px',
    boxShadow: theme.shadows[3],
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[6]
    }
}));

const OptionItem = styled(ListItemButton)(({theme, selected}) => ({
    borderRadius: '8px',
    margin: '4px 0',
    backgroundColor: selected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.05)
    }
}));

const PollsComponent = () => {
    const theme = useTheme();
    const [polls, setPolls] = useState(initialPolls);
    const [showPollDialog, setShowPollDialog] = useState(false);
    const [pollType, setPollType] = useState('local');
    const [newPollQuestion, setNewPollQuestion] = useState('');
    const [newPollTitle, setNewPollTitle] = useState(''); // New state for MS Forms title
    const [newPollOptions, setNewPollOptions] = useState('');
    const [formsLink, setFormsLink] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pollsPerPage = 3;
    const totalPages = Math.ceil(polls.length / pollsPerPage);
    const currentPolls = polls.slice(
        (currentPage - 1) * pollsPerPage,
        currentPage * pollsPerPage
    );

    const handleVote = (pollId, optionId) => {
        setPolls(polls.map(poll => {
            if (poll.id === pollId) {
                if (poll.voted) return poll;

                const updatedOptions = poll.options.map(opt =>
                    opt.id === optionId ? {...opt, votes: opt.votes + 1} : opt
                );

                return {
                    ...poll,
                    options: updatedOptions,
                    totalVotes: poll.totalVotes + 1,
                    voted: true
                };
            }
            return poll;
        }));
    };

    const handleAddPoll = () => {
        if (pollType === 'local') {
            const options = newPollOptions.split(',').map((opt, idx) => ({
                id: idx + 1,
                text: opt.trim(),
                votes: 0
            }));

            const newPoll = {
                id: Date.now(),
                question: newPollQuestion,
                options,
                totalVotes: 0,
                type: "local",
                voted: false
            };

            setPolls([newPoll, ...polls]);
        } else {
            const newPoll = {
                id: Date.now(),
                title: newPollTitle,
                question: "Microsoft Forms Survey",
                link: formsLink,
                type: "forms",
                voted: false
            };

            setPolls([newPoll, ...polls]);
        }

        setShowPollDialog(false);
        setNewPollQuestion('');
        setNewPollTitle('');
        setNewPollOptions('');
        setFormsLink('');
    };

    const calculatePercentage = (votes, total) => {
        return total > 0 ? Math.round((votes / total) * 100) : 0;
    };

    return (
        <Box sx={{mb: 2}}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5" fontWeight="600">
                            Ankiety
                            <Chip
                                label={`${polls.length} aktywne`}
                                size="small"
                                sx={{ml: 2}}
                            />
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setShowPollDialog(true)}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',

                                py: 1
                            }}
                        >
                            <Add/>
                        </Button>
                    </Box>

                    {currentPolls.length === 0 ? (
                        <Box textAlign="center" py={4}>
                            <Poll color="action" sx={{fontSize: 48, mb: 1}}/>
                            <Typography color="text.secondary" variant="h6">
                                Brak ankiet
                            </Typography>
                            <Typography color="text.secondary">
                                Bądź pierwszą osobą, która utworzy ankietę!
                            </Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {currentPolls.map((poll) => (
                                <React.Fragment key={poll.id}>
                                    <ListItem alignItems="flex-start"
                                              sx={{px: 2, borderRadius: 2, backgroundColor: "rgba(237,237,237,0.39)"}}>
                                        <ListItemText
                                            primary={
                                                <Box>
                                                    <Typography variant="h6" fontWeight="500">
                                                        {poll.type === 'forms' ? poll.title : poll.question}
                                                    </Typography>
                                                    {poll.type === 'forms' && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            {poll.question}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                poll.type === 'forms' ? (
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        startIcon={<Link/>}
                                                        href={poll.link}
                                                        target="_blank"
                                                        sx={{mt: 1}}
                                                    >
                                                        Otwórz w MS Forms
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <Box sx={{mt: 1}}>
                                                            {poll.options.map((option) => (
                                                                <Box key={option.id} sx={{mb: 2, borderRadius: 2, backgroundColor: "rgba(214,214,214,0.37)"}}>
                                                                    <OptionItem
                                                                        selected={poll.voted}
                                                                        onClick={() => !poll.voted && handleVote(poll.id, option.id)}
                                                                        disabled={poll.voted}
                                                                    >
                                                                        <Box sx={{width: '100%'}}>
                                                                            <Box display="flex"
                                                                                 justifyContent="space-between">
                                                                                <ListItemText
                                                                                    primary={option.text}
                                                                                    primaryTypographyProps={{
                                                                                        fontWeight: poll.voted ? 600 : 'normal',
                                                                                        color: poll.voted ? theme.palette.primary.main : 'inherit'
                                                                                    }}
                                                                                />
                                                                                {poll.voted && (
                                                                                    <Typography variant="body2"
                                                                                                color="text.secondary">
                                                                                        {option.votes} głosów
                                                                                    </Typography>
                                                                                )}
                                                                            </Box>
                                                                            {poll.voted && (
                                                                                <LinearProgress
                                                                                    variant="determinate"
                                                                                    value={calculatePercentage(option.votes, poll.totalVotes)}
                                                                                    sx={{
                                                                                        mt: 1,
                                                                                        height: 8,
                                                                                        borderRadius: 4,
                                                                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                                                        '& .MuiLinearProgress-bar': {
                                                                                            borderRadius: 4
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        </Box>
                                                                    </OptionItem>
                                                                    {poll.voted && (
                                                                        <Typography variant="caption"
                                                                                    color="text.secondary" sx={{ml: 2}}>
                                                                            {calculatePercentage(option.votes, poll.totalVotes)}%
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            ))}
                                                            <Box display="flex" justifyContent="space-between"
                                                                 alignItems="center" mt={2}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Liczba głosów: {poll.totalVotes}
                                                                </Typography>
                                                                {!poll.voted && (
                                                                    <Chip
                                                                        icon={<HowToVote/>}
                                                                        label="Zagłosuj"
                                                                        size="small"
                                                                    />
                                                                )}

                                                                {poll.voted && (
                                                                    <Check color={"success"}/>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </>
                                                )
                                            }
                                        />
                                    </ListItem>
                                    <Divider sx={{my: 2}}/>
                                </React.Fragment>
                            ))}
                        </List>
                    )}

                    {/* Pagination */}
                    {polls.length > pollsPerPage && (
                        <Box display="flex" justifyContent="center" mt={4}>
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={(e, page) => setCurrentPage(page)}
                                color="primary"
                                shape="rounded"
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        borderRadius: '8px'
                                    }
                                }}
                            />
                        </Box>
                    )}
                </CardContent>


            {/* Add Poll Dialog */}
            <Dialog open={showPollDialog} onClose={() => setShowPollDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{fontWeight: 600}}>Nowa ankieta</DialogTitle>
                <DialogContent>
                    <Tabs
                        value={pollType}
                        onChange={(e, newValue) => setPollType(newValue)}
                        sx={{mb: 2}}
                    >
                        <Tab label="Standardowa" value="local"/>
                        <Tab label="MS Forms" value="forms"/>
                    </Tabs>

                    <Box mt={2}>
                        {pollType === 'local' ? (
                            <Box>
                                <TextField
                                    fullWidth
                                    label="Pytanie"
                                    variant="outlined"
                                    value={newPollQuestion}
                                    onChange={(e) => setNewPollQuestion(e.target.value)}
                                    sx={{mb: 2}}
                                />
                                <TextField
                                    fullWidth
                                    label="Opcje"
                                    variant="outlined"
                                    value={newPollOptions}
                                    onChange={(e) => setNewPollOptions(e.target.value)}
                                    placeholder="Opcja 1, Opcja 2, Opcja 3"
                                    helperText="Oddziel opcje przecinkiem"
                                />
                            </Box>
                        ) : (
                            <Box>
                                <TextField
                                    fullWidth
                                    label="Nazwa"
                                    variant="outlined"
                                    value={newPollTitle}
                                    onChange={(e) => setNewPollTitle(e.target.value)}
                                    sx={{mb: 2}}
                                />
                                <TextField
                                    fullWidth
                                    label="Link"
                                    variant="outlined"
                                    value={formsLink}
                                    onChange={(e) => setFormsLink(e.target.value)}
                                    placeholder="https://forms.office.com/..."
                                />
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{p: 3}}>
                    <Button
                        onClick={() => setShowPollDialog(false)}
                        sx={{borderRadius: '8px'}}
                    >
                        Anuluj
                    </Button>
                    <Button
                        onClick={handleAddPoll}
                        color="primary"
                        variant="contained"
                        disabled={
                            pollType === 'local'
                                ? !newPollQuestion || !newPollOptions
                                : !newPollTitle || !formsLink
                        }
                        sx={{borderRadius: '8px'}}
                    >
                        Utwórz
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PollsComponent;