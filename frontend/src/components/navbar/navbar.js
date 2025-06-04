import React, {useContext, useEffect, useState} from 'react';
import {
    AppBar,
    Toolbar,
    Container,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Badge,
    Divider,
    Typography,
    Box,
    useMediaQuery,
    styled, ListItemIcon, Button, ListItemText, Collapse, List, Drawer, ListItem
} from '@mui/material';
import {
    HomeRounded,
    LoginRounded,
    LogoutRounded,
    NotificationsRounded,
    MenuRounded,
    Person,
    ExpandMore,
    CloseRounded,
    ExpandLess, CalendarMonth, Groups, Sync, Forum, Newspaper, School, LocationOn, ListAlt, LocalLibrary, Checklist,
} from '@mui/icons-material';
import {AuthContext} from "../../AuthContext";
import client from "../../client";
import {API_BASE_URL} from "../../config";
import {useTheme} from '@mui/material/styles';
import {People} from "react-bootstrap-icons";

const StyledAppBar = styled(AppBar)(({theme}) => ({
    backdropFilter: 'blur(8px)',
    backgroundColor: 'rgba(0,0,0,1)',
    transition: theme.transitions.create(['background-color', 'box-shadow']),
}));

const CustomNavbar = () => {
    const theme = useTheme()
    const {isAuthenticated} = useContext(AuthContext);
    const [image, setImage] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileAnchorEl, setMobileAnchorEl] = useState(null);
    const [num, setNum] = useState(0);
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const token = localStorage.getItem("access");
    const image_set = localStorage.getItem("image_set");

    const [managementAnchorEl, setManagementAnchorEl] = useState(null);
    const [socialAnchorEl, setSocialAnchorEl] = useState(null);


    // Menu handlers
    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMobileMenuOpen = (event) => setMobileAnchorEl(event.currentTarget);
    const handleManagementMenuOpen = (event) => setManagementAnchorEl(event.currentTarget);
    const handleSocialMenuOpen = (event) => setSocialAnchorEl(event.currentTarget);
    const handleClose = () => {
        setAnchorEl(null);
        setMobileAnchorEl(null);
        setManagementAnchorEl(null);
        setSocialAnchorEl(null);
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await client.get(API_BASE_URL + "user/", {
                    headers: {Authorization: `Bearer ${token}`},
                });
                const img = response.data.profile_picture
                    ? response.data.profile_picture.toString().slice(15)
                    : "/images/basic/user_no_picture.png";
                setImage(img);
                localStorage.setItem("image_set", img);


            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };


        const fetchNotifications = async () => {
            try {
                const notifications = await client.get(API_BASE_URL + "notifications/", {
                    headers: {Authorization: `Bearer ${token}`},
                });
                setNum(notifications.data.num);
                console.log(notifications)
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        if (token && !image_set) {
            fetchUserData();
        } else {
            setImage(image_set);
        }

        if (token) {
            fetchNotifications()
        }
    }, [image_set, token]);

    const renderDesktopMenu = () => (
        <>
            {isAuthenticated && (
                <>

                    <Box sx={{display: 'flex', alignItems: 'center', ml: 2}}>
                        <IconButton href="/main" sx={{
                            color: 'white',
                            p: 1,
                            borderRadius: 1,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                bgcolor: 'action.hover',
                                transform: 'translateY(-2px)'
                            },
                            '&.Mui-focusVisible': {
                                bgcolor: 'action.selected'
                            }
                        }}>
                            <HomeRounded/>
                        </IconButton>
                    </Box>

                    <IconButton href="/actual-info" sx={{
                        color: 'white',
                        p: 1,
                        borderRadius: 1,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            bgcolor: 'action.hover',
                            transform: 'translateY(-2px)'
                        },
                        '&.Mui-focusVisible': {
                            bgcolor: 'action.selected'
                        }
                    }}>
                        <Typography variant="body1">Aktualności</Typography>
                    </IconButton>

                    <IconButton href="/pierogi" sx={{
                        color: 'white',
                        p: 1,
                        borderRadius: 1,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            bgcolor: 'action.hover',
                            transform: 'translateY(-2px)'
                        },
                        '&.Mui-focusVisible': {
                            bgcolor: 'action.selected'
                        }
                    }}>
                        <Typography variant="body1">Rekrutacja</Typography>
                    </IconButton>


                    <IconButton
                        onClick={handleManagementMenuOpen}
                        sx={{
                            color: 'white',
                            p: 1,
                            borderRadius: 1,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                bgcolor: 'action.hover',
                                transform: 'translateY(-2px)'
                            },
                            '&.Mui-focusVisible': {
                                bgcolor: 'action.selected'
                            }
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                            }}
                        >
                            Planowanie
                            <ExpandMore sx={{
                                fontSize: 18,
                                transition: 'transform 0.2s',
                                transform: Boolean(managementAnchorEl) ? 'rotate(180deg)' : 'none'
                            }}/>
                        </Typography>
                    </IconButton>

                    <Menu
                        anchorEl={managementAnchorEl}
                        open={Boolean(managementAnchorEl)}
                        onClose={handleClose}
                        elevation={2}
                        sx={{
                            '& .MuiPaper-root': {
                                minWidth: 220,
                                borderRadius: 2,
                                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                                mt: 1.5
                            }
                        }}
                        transformOrigin={{horizontal: 'right', vertical: 'top'}}
                        anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                        MenuListProps={{
                            sx: {py: 0.5}
                        }}
                    >
                        <MenuItem
                            href="/calendar"
                            component="a"
                            sx={{
                                py: 1,
                                '&:hover': {
                                    bgcolor: 'primary.light',
                                    color: 'primary.main'
                                }
                            }}
                        >
                            <CalendarMonth sx={{fontSize: 20, mr: 1.5}}/>
                            Kalendarz
                        </MenuItem>

                        <MenuItem
                            href="/localizations"
                            component="a"
                            sx={{
                                py: 1.5,
                                '&:hover': {
                                    bgcolor: 'primary.light',
                                    color: 'primary.main'
                                }
                            }}
                        >
                            <LocationOn sx={{fontSize: 20, mr: 1.5}}/>
                            Lokalizacje
                        </MenuItem>

                        <MenuItem
                            href="/studentCheclist"
                            component="a"
                            sx={{
                                py: 1.5,
                                '&:hover': {
                                    bgcolor: 'primary.light',
                                    color: 'primary.main'
                                }
                            }}
                        >
                            <Checklist sx={{fontSize: 20, mr: 1.5}}/>
                            Checklista
                        </MenuItem>
                    </Menu>


                    <IconButton
                        onClick={handleSocialMenuOpen}
                        sx={{
                            color: 'white',
                            p: 1,
                            borderRadius: 1,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                bgcolor: 'action.hover',
                                transform: 'translateY(-2px)'
                            },
                            '&.Mui-focusVisible': {
                                bgcolor: 'action.selected'
                            }
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                            }}
                        >
                            Społeczność
                            <ExpandMore sx={{
                                fontSize: 18,
                                transition: 'transform 0.2s',
                                transform: Boolean(socialAnchorEl) ? 'rotate(180deg)' : 'none'
                            }}/>
                        </Typography>
                    </IconButton>

                    <Menu
                        anchorEl={socialAnchorEl}
                        open={Boolean(socialAnchorEl)}
                        onClose={handleClose}
                        elevation={2}
                        sx={{
                            '& .MuiPaper-root': {
                                minWidth: 220,
                                borderRadius: 2,
                                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                                mt: 1.5
                            }
                        }}
                        transformOrigin={{horizontal: 'right', vertical: 'top'}}
                        anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                        MenuListProps={{
                            sx: {py: 0.5}
                        }}
                    >
                        <MenuItem
                            href="/groups"
                            component="a"
                            sx={{
                                py: 1.5,
                                '&:hover': {
                                    bgcolor: 'primary.light',
                                    color: 'primary.main'
                                }
                            }}
                        >
                            <Groups sx={{fontSize: 20, mr: 1.5}}/>
                            Grupy
                        </MenuItem>

                        <MenuItem
                            href="/exchanges"
                            component="a"
                            sx={{
                                py: 1.5,
                                '&:hover': {
                                    bgcolor: 'primary.light',
                                    color: 'primary.main'
                                }
                            }}
                        >
                            <Sync sx={{fontSize: 20, mr: 1.5}}/>
                            Wymiany
                        </MenuItem>

                        <MenuItem
                            href="/forum"
                            component="a"
                            sx={{
                                py: 1.5,
                                '&:hover': {
                                    bgcolor: 'primary.light',
                                    color: 'primary.main'
                                }
                            }}
                        >
                            <Forum sx={{fontSize: 20, mr: 1.5}}/>
                            Forum
                        </MenuItem>
                    </Menu>

                    <IconButton href="/learning" sx={{
                        color: 'white',
                        p: 1,
                        borderRadius: 1,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            bgcolor: 'action.hover',
                            transform: 'translateY(-2px)'
                        },
                        '&.Mui-focusVisible': {
                            bgcolor: 'action.selected'
                        }
                    }}>
                        <Typography variant="body1">Nauka</Typography>
                    </IconButton>
                </>
            )}
        </>
    );

    const [mobileOpen, setMobileOpen] = useState(false);
    const [expandedSection, setExpandedSection] = useState(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const renderSidebarContent = () => (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                p: 2
            }}
        >
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
                p: 1
            }}>
                <Typography variant="h6" fontWeight="bold">
                    Menu
                </Typography>
                <IconButton onClick={handleDrawerToggle}>
                    <CloseRounded/>
                </IconButton>
            </Box>

            <Divider sx={{mb: 2}}/>

            <List component="nav" sx={{flexGrow: 1}}>
                {isAuthenticated && (
                    <>
                        <ListItem button href="/main" component="a">
                            <ListItemIcon>
                                <HomeRounded/>
                            </ListItemIcon>
                            <ListItemText sx={{color: 'black'}} primary="Strona główna"/>
                        </ListItem>

                        <ListItem button href="/actual-info" component="a">
                            <ListItemIcon>
                                <Newspaper/>
                            </ListItemIcon>
                            <ListItemText sx={{color: 'black'}} primary="Aktualności"/>
                        </ListItem>


                        <ListItem button href="/pierogi" component="a">
                            <ListItemIcon>
                                <School/>
                            </ListItemIcon>
                            <ListItemText sx={{color: 'black'}} primary="Rekrutacja"/>
                        </ListItem>

                        <ListItem button onClick={() => toggleSection('manage')}>
                            <ListItemIcon>
                                <ListAlt/>
                            </ListItemIcon>
                            <ListItemText primary="Planowanie"/>
                            {expandedSection === 'manage' ? <ExpandLess/> : <ExpandMore/>}
                        </ListItem>

                        <Collapse in={expandedSection === 'manage'} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <ListItem button href="/calendar" component="a" sx={{pl: 4}}>
                                    <ListItemIcon>
                                        <CalendarMonth/>
                                    </ListItemIcon>
                                    <ListItemText sx={{color: 'black'}} primary="Kalendarz"/>
                                </ListItem>

                                <ListItem button href="/localizations" component="a" sx={{pl: 4}}>
                                    <ListItemIcon>
                                        <LocationOn/>
                                    </ListItemIcon>
                                    <ListItemText sx={{color: 'black'}} primary="Lokalizacje"/>
                                </ListItem>

                                <ListItem button href="/studentCheclist" component="a" sx={{pl: 4}}>
                                    <ListItemIcon>
                                        <Checklist/>
                                    </ListItemIcon>
                                    <ListItemText sx={{color: 'black'}} primary="Checklista"/>
                                </ListItem>
                            </List>
                        </Collapse>


                        <ListItem button onClick={() => toggleSection('community')}>
                            <ListItemIcon>
                                <People/>
                            </ListItemIcon>
                            <ListItemText primary="Społeczność"/>
                            {expandedSection === 'community' ? <ExpandLess/> : <ExpandMore/>}
                        </ListItem>

                        <Collapse in={expandedSection === 'community'} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <ListItem button href="/groups" component="a" sx={{pl: 4}}>
                                    <ListItemIcon>
                                        <Groups/>
                                    </ListItemIcon>
                                    <ListItemText sx={{color: 'black'}} primary="Grupy"/>
                                </ListItem>

                                <ListItem button href="/exchanges" component="a" sx={{pl: 4}}>
                                    <ListItemIcon>
                                        <Sync/>
                                    </ListItemIcon>
                                    <ListItemText sx={{color: 'black'}} primary="Wymiany"/>
                                </ListItem>

                                <ListItem button href="/forum" component="a" sx={{pl: 4}}>
                                    <ListItemIcon>
                                        <Forum/>
                                    </ListItemIcon>
                                    <ListItemText sx={{color: 'black'}} primary="Forum"/>
                                </ListItem>

                            </List>
                        </Collapse>


                        <ListItem button href="/learning" component="a">
                            <ListItemIcon>
                                <LocalLibrary/>
                            </ListItemIcon>
                            <ListItemText sx={{color: 'black'}} primary="Nauka"/>
                        </ListItem>
                    </>
                )}
            </List>

            <Box sx={{mt: 'auto', p: 1}}>
                <Button
                    fullWidth
                    href={isAuthenticated ? '/logout' : '/login'}
                    component="a"
                    startIcon={isAuthenticated ? <LogoutRounded color={"white"}/> : <LoginRounded  color={"white"}/>}
                    sx={{
                        py: 1.5,
                        borderRadius: 1,
                        color: isAuthenticated ? 'error.main' : 'success.main',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            bgcolor: 'action.hover',
                            transform: 'translateY(-2px)'
                        },
                    }}
                >
                    {isAuthenticated ? 'Wyloguj się' : 'Zaloguj się'}
                </Button>
            </Box>
        </Box>
    );

    return (
        <StyledAppBar position="sticky" elevation={0}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Box href="/" component="a" sx={{
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        mr: 3
                    }}>
                        <img
                            width={30}
                            style={{margin: 10}}
                            src={"/icons/miun.ico"}
                            alt="Logo"
                        />

                        <img
                            height={15}
                            style={{margin: "10px 0 10px 0px"}}
                            src={"/icons/name.ico"}
                            alt="Logo"
                        />

                    </Box>

                    {!isSmallScreen && renderDesktopMenu()}

                    <Box sx={{flexGrow: 1}}/>

                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>

                        {isAuthenticated && (
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                flexDirection: 'row', // Zawsze układ w poziomie
                                flexWrap: 'nowrap', // Zapobiega zawijaniu
                                '& > *': { // Gwarancja stałej wielkości elementów
                                    flexShrink: 0
                                }
                            }}>
                                {isAuthenticated && (
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        // Responsywny margines
                                        mr: {xs: 1, md: 2},
                                        // Płynna animacja
                                        transition: theme.transitions.create('all', {
                                            duration: theme.transitions.duration.short,
                                        }),
                                    }}>
                                        <IconButton
                                            href="/notifications"
                                            sx={{
                                                color: 'white',
                                                p: 1,
                                                borderRadius: 1,
                                                transition: 'all 0.2s ease',
                                                transform: {
                                                    xs: 'scale(0.9)', // Lekkie pomniejszenie na mobile
                                                    md: 'scale(1)'
                                                },
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                    transform: {
                                                        xs: 'translateY(-2px) scale(0.9)',
                                                        md: 'translateY(-2px) scale(1)'
                                                    }
                                                },
                                                '&.Mui-focusVisible': {
                                                    bgcolor: 'action.selected'
                                                }
                                            }}
                                        >
                                            <Badge badgeContent={num} color="error">
                                                <NotificationsRounded sx={{
                                                    fontSize: {
                                                        xs: '20px', // Mniejszy rozmiar na mobile
                                                        md: '22px'
                                                    }
                                                }}/>
                                            </Badge>
                                        </IconButton>

                                        <IconButton
                                            href="/userProfile"
                                            sx={{
                                                transform: {
                                                    xs: 'scale(0.85)', // Dopasowanie skali avatara
                                                    md: 'scale(1)'
                                                },
                                                transition: 'transform 0.2s ease'
                                            }}
                                        >
                                            <Avatar
                                                src={image}
                                                sx={{
                                                    width: {
                                                        xs: 32, // Mniejszy avatar na mobile
                                                        md: 36
                                                    },
                                                    height: {
                                                        xs: 32,
                                                        md: 36
                                                    },
                                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)'
                                    }

                                                }}
                                            >
                                                <Person/>
                                            </Avatar>
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                        )}

                        {isSmallScreen ? (
                            <>
                                <IconButton
                                    edge="start"
                                    aria-label="menu"
                                    onClick={handleDrawerToggle}
                                    sx={{ml: 0.5}}
                                >
                                    <MenuRounded sx={{color: 'white'}}/>
                                </IconButton>
                                <Drawer
                                    variant="temporary"
                                    anchor="left"
                                    open={mobileOpen}
                                    onClose={handleDrawerToggle}
                                    ModalProps={{
                                        keepMounted: true,
                                        disableScrollLock: true,
                                    }}
                                    sx={{
                                        '& .MuiDrawer-paper': {
                                            width: 280,
                                            boxSizing: 'border-box',
                                        },
                                    }}
                                >
                                    {renderSidebarContent()}
                                </Drawer>
                            </>
                        ) : (
                            <IconButton
                                href={isAuthenticated ? '/logout' : '/login'}
                                sx={{
                                    borderRadius: 2,
                                    px: 2,
                                    bgcolor: "rgba(255,255,255,0)",
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                {isAuthenticated ? <LogoutRounded sx={{ color: "white" }}/> : <LoginRounded  sx={{ color: "white" }}/>}
                                <Typography sx={{ml: 1, color: "white"}}>
                                    {isAuthenticated ? 'Wyloguj' : 'Zaloguj'}
                                </Typography>
                            </IconButton>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </StyledAppBar>
    );
};

export default CustomNavbar;