'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  getDocs,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/database/firebase';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Send, Trash2 } from 'lucide-react';

export default function ForumPage() {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: '' });
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, setUser);
    const q = query(collection(db, 'forumPosts'), orderBy('timestamp', 'desc'));

    const unsubPosts = onSnapshot(q, async (snapshot) => {
      const data = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const post = docSnap.data();
          const commentsSnap = await getDocs(collection(db, 'forumPosts', docSnap.id, 'comments'));
          const comments = commentsSnap.docs.map((c) => ({ id: c.id, ...c.data() }));
          return { id: docSnap.id, ...post, comments };
        })
      );
      setPosts(data);
    });

    return () => {
      unsubAuth();
      unsubPosts();
    };
  }, []);

  const handleAddPost = async () => {
    if (!newPost.title || !newPost.content || !user) return;
    await addDoc(collection(db, 'forumPosts'), {
      author: user.displayName || 'Anonymous',
      authorId: user.uid,
      avatar: user.photoURL || '/placeholder.svg',
      title: newPost.title,
      content: newPost.content,
      category: newPost.category || 'General',
      timestamp: serverTimestamp(),
      likes: 0,
      likedBy: [],
    });
    setNewPost({ title: '', content: '', category: '' });
  };

  const handleDeletePost = async (postId: string) => {
    await deleteDoc(doc(db, 'forumPosts', postId));
    const comments = await getDocs(collection(db, 'forumPosts', postId, 'comments'));
    for (const c of comments.docs) {
      await deleteDoc(doc(db, 'forumPosts', postId, 'comments', c.id));
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = newComment[postId];
    if (!content || !user) return;
    await addDoc(collection(db, 'forumPosts', postId, 'comments'), {
      author: user.displayName || 'Anonymous',
      authorId: user.uid,
      avatar: user.photoURL || '/placeholder.svg',
      content,
      timestamp: serverTimestamp(),
      likes: 0,
      likedBy: [],
    });
    setNewComment((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleLike = async (path: string, liked: boolean) => {
    const ref = doc(db, ...path.split('/'));
    await updateDoc(ref, {
      likedBy: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
  };

  const toggleComments = (postId: string) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const formatDate = (ts: any) => ts?.toDate ? ts.toDate().toLocaleString() : 'Just now';

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-2">Hacker Forum</h1>
        <p className="text-muted-foreground">Share knowledge, ask questions, and connect with others</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Create a New Post</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Category" value={newPost.category} onChange={(e) => setNewPost({ ...newPost, category: e.target.value })} />
          <Input placeholder="Title" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} />
          <Textarea placeholder="What's on your mind?" rows={4} value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} />
          <Button onClick={handleAddPost} className="w-full">Post</Button>
        </CardContent>
      </Card>

      {posts.map((post) => {
        const isOwner = user?.uid === post.authorId;
        const likedPost = post.likedBy.includes(user?.uid);
        return (
          <Card key={post.id}>
            <CardHeader className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar><AvatarImage src={post.avatar} /><AvatarFallback>{post.author[0]}</AvatarFallback></Avatar>
                <div>
                  <h3 className="font-semibold">{post.author}</h3>
                  <p className="text-xs text-muted-foreground">{formatDate(post.timestamp)}</p>
                </div>
              </div>
              {isOwner && (
                <Button variant="ghost" size="icon" onClick={() => handleDeletePost(post.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <h2 className="text-lg font-bold">{post.title}</h2>
              <p>{post.content}</p>
              <Badge>{post.category}</Badge>
              <div className="flex gap-4">
                <Button variant="ghost" size="sm" className={`gap-2 ${likedPost ? 'text-red-500' : ''}`} onClick={() => handleLike(`forumPosts/${post.id}`, likedPost)}>
                  <Heart className={`w-4 h-4 ${likedPost ? 'fill-current' : ''}`} /> {post.likedBy.length}
                </Button>
                <Button variant="ghost" size="sm" className="gap-2" onClick={() => toggleComments(post.id)}>
                  <MessageCircle className="w-4 h-4" /> {post.comments.length}
                </Button>
              </div>
              {showComments[post.id] && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Write a comment..."
                      value={newComment[post.id] || ''}
                      onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                    />
                    <Button onClick={() => handleAddComment(post.id)} disabled={!newComment[post.id]?.trim()}><Send className="w-4 h-4" /></Button>
                  </div>
                  {post.comments.map((c: any) => {
                    const likedComment = c.likedBy.includes(user?.uid);
                    return (
                      <div key={c.id} className="flex gap-3">
                        <Avatar className="w-8 h-8"><AvatarImage src={c.avatar} /><AvatarFallback>{c.author[0]}</AvatarFallback></Avatar>
                        <div className="flex-1">
                          <div className="bg-muted p-2 rounded-lg">
                            <div className="flex justify-between text-sm">
                              <span className="font-semibold">{c.author}</span>
                              <span className="text-muted-foreground">{formatDate(c.timestamp)}</span>
                            </div>
                            <p className="text-sm mt-1">{c.content}</p>
                          </div>
                          <div className="flex gap-2 mt-1">
                            <Button variant="ghost" size="sm" className={`h-6 text-xs ${likedComment ? 'text-red-500' : ''}`} onClick={() => handleLike(`forumPosts/${post.id}/comments/${c.id}`, likedComment)}>
                              <Heart className={`w-3 h-3 ${likedComment ? 'fill-current' : ''}`} /> {c.likedBy.length}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}