import React, { useState, useEffect } from 'react';
import { 
  Badge, 
  IconButton, 
  Popover, 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Button,
  Divider,
  CircularProgress
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CircleIcon from '@mui/icons-material/Circle';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { 
  fetchNotificationsAction, 
  markNotificationAsReadAction, 
  markAllNotificationsAsReadAction 
} from '../redux/notificationActions';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNotificationWebSocket } from '@/hooks/useNotificationWebSocket';

export const NotificationPanel: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const dispatch = useAppDispatch();
  const { items, unreadCount, isLoading } = useAppSelector(state => state.notifications);

  // Initialize WebSocket connection
  useNotificationWebSocket();

  useEffect(() => {
    dispatch(fetchNotificationsAction() as any);
  }, [dispatch]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (id: number) => {
    dispatch(markNotificationAsReadAction(id) as any);
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsReadAction() as any);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <IconButton color="inherit" onClick={handleClick} aria-describedby={id}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon sx={{ color: '#64748b' }} />
        </Badge>
      </IconButton>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 360, maxHeight: 500 }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Thông báo</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead}>
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </Box>
        <Divider />
        
        {isLoading && items.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Không có thông báo nào.
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {items.map((notif) => (
              <React.Fragment key={notif.id}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{ 
                    bgcolor: notif.is_read ? 'transparent' : 'action.hover',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                  onClick={() => {
                    if (!notif.is_read) handleMarkAsRead(notif.id);
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <NotificationsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: notif.is_read ? 'normal' : 'bold' }}>
                        {notif.title}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" color="text.primary" sx={{ display: 'block', mb: 0.5 }}>
                          {notif.body}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: vi })}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                  {!notif.is_read && (
                    <CircleIcon sx={{ fontSize: 12, color: 'primary.main', mt: 1 }} />
                  )}
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
};
