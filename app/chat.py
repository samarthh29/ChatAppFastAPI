from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, or_, func, distinct
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from app.dependencies import get_current_user, get_db
from app.models.chat import ChatMessage, PrivateMessage

router = APIRouter()

# ======================
# Room Management
# ======================

@router.get("/rooms", response_model=dict)
async def get_all_rooms(
    db: Session = Depends(get_db)
) -> dict:
    """
    List all available chat rooms that have messages.
    Returns:
        {"rooms": ["general", "random"]}
    """
    rooms = db.query(ChatMessage.room_id).distinct().all()
    return {"rooms": [room[0] for room in rooms]}

@router.post("/rooms/create", response_model=dict)
async def create_room(
    room_id: str,
    db: Session = Depends(get_db)
) -> dict:
    """
    Explicitly create a new chat room.
    Args:
        room_id: Name/ID for the new room (e.g., "general")
    """
    existing = db.query(ChatMessage).filter(
        ChatMessage.room_id == room_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Room '{room_id}' already exists"
        )
    
    return {
        "status": "success",
        "room_id": room_id,
        "message": "Room created (send a message to initialize)"
    }

# ======================
# Room Message Handling
# ======================

@router.post("/rooms/send", response_model=dict)
async def send_room_message(
    room_id: str,
    content: str,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """
    Send a message to a specific room.
    Creates the room if it doesn't exist.
    """
    try:
        message = ChatMessage(
            room_id=room_id,
            user_id=current_user,
            content=content,
            timestamp=datetime.utcnow()
        )
        
        db.add(message)
        db.commit()
        
        return {
            "status": "success",
            "room_id": room_id,
            "message": "Message sent"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send message: {str(e)}"
        )

@router.get("/rooms/{room_id}/history", response_model=dict)
async def get_room_history(
    room_id: str,
    limit: Optional[int] = 100,
    db: Session = Depends(get_db)
) -> dict:
    """
    Get message history for a room with pagination.
    Args:
        room_id: The room to query
        limit: Max messages to return (default: 100)
    """
    try:
        messages = (
            db.query(ChatMessage)
            .filter(ChatMessage.room_id == room_id)
            .order_by(ChatMessage.timestamp.desc())
            .limit(limit)
            .all()
        )
        
        if not messages:
            raise HTTPException(
                status_code=404,
                detail=f"Room '{room_id}' not found or empty"
            )
        
        return {
            "room_id": room_id,
            "count": len(messages),
            "messages": [
                {
                    "user_id": msg.user_id,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat()
                }
                for msg in reversed(messages)  # Return oldest first
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving history: {str(e)}"
        )

# ======================
# Private Messaging
# ======================

@router.post("/private/send", response_model=dict)
async def send_private_message(
    receiver_id: str,
    content: str,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Send a private message between users"""
    try:
        message = PrivateMessage(
            sender_id=current_user,
            receiver_id=receiver_id,
            content=content,
            timestamp=datetime.utcnow()
        )
        
        db.add(message)
        db.commit()
        
        return {
            "status": "success",
            "message": "Private message sent"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send private message: {str(e)}"
        )

@router.get("/private/history/{other_user_id}", response_model=dict)
async def get_private_history(
    other_user_id: str,
    limit: Optional[int] = 100,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Get conversation history between two users"""
    try:
        messages = (
            db.query(PrivateMessage)
            .filter(
                or_(
                    and_(
                        PrivateMessage.sender_id == current_user,
                        PrivateMessage.receiver_id == other_user_id
                    ),
                    and_(
                        PrivateMessage.sender_id == other_user_id,
                        PrivateMessage.receiver_id == current_user
                    )
                )
            )
            .order_by(PrivateMessage.timestamp.desc())
            .limit(limit)
            .all()
        )
        
        return {
            "participants": [current_user, other_user_id],
            "count": len(messages),
            "messages": [
                {
                    "sender_id": msg.sender_id,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat()
                }
                for msg in reversed(messages)  # Oldest first
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving private history: {str(e)}"
        )

# ======================
# Unified Conversations
# ======================

@router.get("/conversations/unified", response_model=dict)
async def get_unified_conversations(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 100
) -> dict:
    """
    Get all conversations (both room and private) for the current user.
    Returns them in chronological order.
    """
    try:
        # Get room messages where user participated
        room_messages = (
            db.query(ChatMessage)
            .filter(ChatMessage.user_id == current_user)
            .order_by(ChatMessage.timestamp.desc())
            .limit(limit)
            .all()
        )
        
        # Get private messages (both sent and received)
        private_messages = (
            db.query(PrivateMessage)
            .filter(
                or_(
                    PrivateMessage.sender_id == current_user,
                    PrivateMessage.receiver_id == current_user
                )
            )
            .order_by(PrivateMessage.timestamp.desc())
            .limit(limit)
            .all()
        )
        
        # Combine and sort all messages
        all_messages = []
        
        for msg in room_messages:
            all_messages.append({
                "type": "room",
                "id": msg.id,
                "room_id": msg.room_id,
                "sender_id": msg.user_id,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat()
            })
        
        for msg in private_messages:
            all_messages.append({
                "type": "private",
                "id": msg.id,
                "other_user": msg.receiver_id if msg.sender_id == current_user else msg.sender_id,
                "sender_id": msg.sender_id,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat()
            })
        
        # Sort by timestamp (newest first)
        all_messages.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return {
            "user_id": current_user,
            "count": len(all_messages),
            "conversations": all_messages[:limit]  # Apply final limit
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving unified conversations: {str(e)}"
        )

@router.get("/conversations/with/{other_user_id}", response_model=dict)
async def get_conversation_with_user(
    other_user_id: str,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 100
) -> dict:
    """
    Get all messages between current user and another specific user.
    Includes both private messages and room messages where both participated.
    """
    try:
        # 1. Get private messages between these two users
        private_messages = (
            db.query(PrivateMessage)
            .filter(
                or_(
                    and_(
                        PrivateMessage.sender_id == current_user,
                        PrivateMessage.receiver_id == other_user_id
                    ),
                    and_(
                        PrivateMessage.sender_id == other_user_id,
                        PrivateMessage.receiver_id == current_user
                    )
                )
            )
            .order_by(PrivateMessage.timestamp.asc())  # Oldest first
            .limit(limit)
            .all()
        )

        # 2. Find rooms where both users have messages
        common_rooms_subquery = (
            db.query(ChatMessage.room_id)
            .filter(ChatMessage.user_id.in_([current_user, other_user_id]))
            .group_by(ChatMessage.room_id)
            .having(func.count(distinct(ChatMessage.user_id)) == 2)
            .subquery()
        )

        # 3. Get messages from those shared rooms
        room_messages = (
            db.query(ChatMessage)
            .filter(
                ChatMessage.room_id.in_(common_rooms_subquery),
                ChatMessage.user_id.in_([current_user, other_user_id])
            )
            .order_by(ChatMessage.timestamp.asc())
            .limit(limit)
            .all()
        )

        # Combine and format messages
        conversations = []
        
        for msg in private_messages:
            conversations.append({
                "type": "private",
                "id": msg.id,
                "sender_id": msg.sender_id,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat()
            })
        
        for msg in room_messages:
            conversations.append({
                "type": "room",
                "id": msg.id,
                "room_id": msg.room_id,
                "sender_id": msg.user_id,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat()
            })
        
        # Sort by timestamp and return most recent
        conversations.sort(key=lambda x: x["timestamp"])
        
        return {
            "participants": [current_user, other_user_id],
            "count": len(conversations),
            "messages": conversations[-limit:] if limit else conversations
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving conversation: {str(e)}"
        )
    
@router.get("/conversations/thread/{other_user_id}", response_model=dict)
async def get_conversation_thread(
    other_user_id: str,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 100,
    offset: int = 0
) -> dict:
    """
    Get complete conversation thread with another user (like a chat window).
    Shows both sent and received messages in chronological order.
    Includes:
    - Private messages between the users
    - Room messages where both participated
    Returns messages with direction indicators ('sent' or 'received')
    """
    try:
        # 1. Get private messages between these two users
        private_messages = (
            db.query(PrivateMessage)
            .filter(
                or_(
                    and_(
                        PrivateMessage.sender_id == current_user,
                        PrivateMessage.receiver_id == other_user_id
                    ),
                    and_(
                        PrivateMessage.sender_id == other_user_id,
                        PrivateMessage.receiver_id == current_user
                    )
                )
            )
            .order_by(PrivateMessage.timestamp.asc())
            .offset(offset)
            .limit(limit)
            .all()
        )

        # 2. Find rooms where both users have messages
        common_rooms_subquery = (
            db.query(ChatMessage.room_id)
            .filter(ChatMessage.user_id.in_([current_user, other_user_id]))
            .group_by(ChatMessage.room_id)
            .having(func.count(distinct(ChatMessage.user_id)) == 2)
            .subquery()
        )

        # 3. Get messages from those shared rooms
        room_messages = (
            db.query(ChatMessage)
            .filter(
                ChatMessage.room_id.in_(common_rooms_subquery),
                ChatMessage.user_id.in_([current_user, other_user_id])
            )
            .order_by(ChatMessage.timestamp.asc())
            .offset(offset)
            .limit(limit)
            .all()
        )

        # Combine and format messages
        thread = []
        
        # Format private messages
        for msg in private_messages:
            thread.append({
                "type": "private",
                "id": msg.id,
                "message_type": "text",  # Can be extended for media
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat(),
                "direction": "sent" if msg.sender_id == current_user else "received",
                "sender_id": msg.sender_id,
                "receiver_id": msg.receiver_id
            })
        
        # Format room messages
        for msg in room_messages:
            thread.append({
                "type": "room",
                "id": msg.id,
                "message_type": "text",
                "room_id": msg.room_id,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat(),
                "direction": "sent" if msg.user_id == current_user else "received",
                "sender_id": msg.user_id
            })
        
        # Sort by timestamp (oldest first)
        thread.sort(key=lambda x: x["timestamp"])
        
        # Get total counts for pagination
        total_private = (
            db.query(func.count(PrivateMessage.id))
            .filter(
                or_(
                    and_(
                        PrivateMessage.sender_id == current_user,
                        PrivateMessage.receiver_id == other_user_id
                    ),
                    and_(
                        PrivateMessage.sender_id == other_user_id,
                        PrivateMessage.receiver_id == current_user
                    )
                )
            )
            .scalar()
        )
        
        total_room = (
            db.query(func.count(ChatMessage.id))
            .filter(
                ChatMessage.room_id.in_(common_rooms_subquery),
                ChatMessage.user_id.in_([current_user, other_user_id])
            )
            .scalar()
        )
        
        return {
            "metadata": {
                "current_user": current_user,
                "other_user": other_user_id,
                "total_messages": total_private + total_room
            },
            "messages": thread,
            "pagination": {
                "limit": limit,
                "offset": offset,
                "has_more": (offset + limit) < (total_private + total_room)
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving conversation thread: {str(e)}"
        )