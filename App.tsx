import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/Header';
import { PostForm } from './components/PostForm';
import { PostCard } from './components/PostCard';
import { FilterTabs } from './components/FilterTabs';
import { FeedSpinner } from './components/FeedSpinner';
import { ProfilePage } from './components/ProfilePage';
import { UserSearchPage } from './components/UserSearchPage';
import { EditProfileModal } from './components/EditProfileModal';
import { EditPostModal } from './components/EditPostModal';
import { CreateClubModal } from './components/CreateClubModal';
import { ClubCard } from './components/ClubCard';
import { ClubPage } from './components/ClubPage';
import { AuthPage } from './components/AuthPage';
import { FeedToggle } from './components/FeedToggle';
import { DocumentAddIcon, UsersIcon } from './components/Icons';
import { Post, Category, View, UserProfile, Club, DraftPost, ItemType, ReactionType, CurrentUserProfile } from './types';

function App() {
    const [session, setSession] = useState<Session | null>(null);
    const [currentUser, setCurrentUser] = useState<CurrentUserProfile | null>(null);
    
    const [view, setView] = useState<View>('feed');
    const [posts, setPosts] = useState<Post[]>([]);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [feedType, setFeedType] = useState<'following' | 'global'>('following');

    const [editingProfile, setEditingProfile] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [isCreatingClub, setIsCreatingClub] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [selectedClub, setSelectedClub] = useState<Club | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [userSearchResults, setUserSearchResults] = useState<UserProfile[]>([]);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        // Safely unsubscribe to prevent crashes on startup.
        return () => {
            data.subscription?.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (session) {
            fetchInitialData();
        } else {
            // Clear data when user logs out
            setCurrentUser(null);
            setPosts([]);
            setClubs([]);
            setIsLoading(false);
        }
    }, [session]);

    const fetchInitialData = async () => {
        if (!session) return;
        setIsLoading(true);
        await Promise.all([
            fetchCurrentUser(),
            fetchPosts(),
            fetchClubs(),
        ]);
        setIsLoading(false);
    };

    const fetchCurrentUser = async () => {
        if (!session?.user) return;
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (profileError) {
            console.error('Error fetching user profile:', profileError);
            return;
        }

        const { data: followingData, error: followingError } = await supabase
            .from('user_follows')
            .select('following_id')
            .eq('follower_id', session.user.id);
        
        if (followingError) console.error('Error fetching following list:', followingError);

        setCurrentUser({
            ...profileData,
            following: followingData?.map(f => f.following_id) || []
        });
    };

    const fetchPosts = async () => {
        const { data, error } = await supabase
            .from('posts')
            .select('*, author:profiles(*), comments(*, author:profiles(*))')
            .order('created_at', { ascending: false });
        
        if (error) console.error('Error fetching posts:', error);
        else setPosts(data as any[] || []);
    };

    const fetchClubs = async () => {
        const { data, error } = await supabase
            .from('clubs')
            .select('*, club_members(user_id)');
            
        if (error) console.error('Error fetching clubs:', error);
        else {
             const formattedClubs = data?.map(club => ({
                id: club.id,
                name: club.name,
                description: club.description,
                bannerUrl: club.banner_url,
                members: club.club_members.map((m: any) => m.user_id),
                memberCount: club.club_members.length,
            })) || [];
            setClubs(formattedClubs);
        }
    };


    const handleNavigate = (newView: View) => {
        setSelectedPost(null);
        setSelectedClub(null);
        setSelectedUser(null);
        setView(newView);
    };
    
    const handleNewPost = async (newPostData: { title: string, content: string, category: Category, itemType?: ItemType, location?: string, eventDate?: string, eventTime?: string, eventLocation?: string }, mediaFile: File | null) => {
        if (!currentUser) return;
        let media_url: string | undefined = undefined;
        let media_type: string | undefined = undefined;
        
        if (mediaFile) {
            const fileExt = mediaFile.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('media').upload(fileName, mediaFile);
            if (uploadError) {
                console.error('Error uploading file:', uploadError);
                return;
            }
            const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName);
            media_url = urlData.publicUrl;
            media_type = mediaFile?.type.startsWith('image') ? 'image' : 'video';
        }

        const { data: newPost, error } = await supabase
            .from('posts')
            .insert({
                author_id: currentUser.id,
                title: newPostData.title,
                content: newPostData.content,
                category: newPostData.category,
                reactions: {},
                media_url,
                media_type,
                ...newPostData
            })
            .select('*, author:profiles(*), comments(*, author:profiles(*))')
            .single();

        if (error) console.error('Error creating post:', error);
        else if (newPost) setPosts(prevPosts => [newPost as any, ...prevPosts]);
    };
    
    const handleSaveDraft = (draft: Omit<DraftPost, 'draftId'>, mediaFile: File | null) => {
        console.log('Draft saved (local):', { ...draft, mediaFile });
        alert('Draft saved locally! This will be stored in your browser.');
    };

    const handleAddComment = async (postId: string, commentContent: string) => {
        if (!currentUser) return;
        const { data: newComment, error } = await supabase
            .from('comments')
            .insert({ post_id: postId, author_id: currentUser.id, content: commentContent })
            .select('*, author:profiles(*)')
            .single();
        
        if (error) console.error('Error adding comment:', error);
        else if (newComment) {
            setPosts(posts.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment as any] } : p));
        }
    };

    const handleReactToPost = async (postId: string, reaction: ReactionType) => {
        if (!currentUser) return;
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        const newReactions = { ...(post.reactions || {}) };
        const userId = currentUser.id;

        const alreadyReactedWithThis = newReactions[reaction]?.includes(userId);

        for (const key in newReactions) {
            const reactionType = key as ReactionType;
            newReactions[reactionType] = (newReactions[reactionType] || []).filter(id => id !== userId);
        }

        if (!alreadyReactedWithThis) {
            if (!newReactions[reaction]) newReactions[reaction] = [];
            newReactions[reaction].push(userId);
        }
        
        const { error } = await supabase.from('posts').update({ reactions: newReactions }).eq('id', postId);
        
        if (error) console.error("Error updating reactions:", error);
        else setPosts(posts.map(p => p.id === postId ? { ...p, reactions: newReactions } : p));
    };

    const handleSaveProfile = async (updatedProfile: UserProfile) => {
        const { data, error } = await supabase
            .from('profiles')
            .update({ 
                name: updatedProfile.name, 
                bio: updatedProfile.bio,
                major: updatedProfile.major,
                graduation_year: updatedProfile.graduationYear
            })
            .eq('id', updatedProfile.id)
            .select()
            .single();

        if (error) console.error("Error updating profile:", error);
        else if(data) {
            setCurrentUser(prev => prev ? {...prev, ...data} : null);
            setEditingProfile(false);
            fetchPosts(); // Refresh posts to show updated author info
        }
    };
    
    const handleSavePost = async (postId: string, newTitle: string, newContent: string) => {
        const { data, error } = await supabase
            .from('posts')
            .update({ title: newTitle, content: newContent, edited: true })
            .eq('id', postId)
            .select('*, author:profiles(*), comments(*, author:profiles(*))')
            .single();
            
        if (error) console.error("Error updating post:", error)
        else if (data) {
            setPosts(posts.map(p => p.id === postId ? data as any : p));
            setEditingPost(null);
        }
    };

    const handleJoinClub = async (clubId: string) => {
        if (!currentUser) return;
        const { error } = await supabase.from('club_members').insert({ club_id: clubId, user_id: currentUser.id });
        if (error) console.error("Error joining club:", error);
        else fetchClubs(); // Re-fetch to update member list and count
    };

    const handleLeaveClub = async (clubId: string) => {
        if (!currentUser) return;
        const { error } = await supabase.from('club_members').delete().match({ club_id: clubId, user_id: currentUser.id });
        if (error) console.error("Error leaving club:", error);
        else fetchClubs();
    };

    const handleSaveClub = async (updatedClub: Club) => {
        const { error } = await supabase
            .from('clubs')
            .update({ name: updatedClub.name, description: updatedClub.description, banner_url: updatedClub.bannerUrl })
            .eq('id', updatedClub.id);

        if (error) console.error("Error saving club:", error);
        else {
            fetchClubs();
            setSelectedClub(prev => prev ? { ...prev, ...updatedClub } : null);
        }
    };

    const handleCreateClub = async (newClubData: { name: string, description: string, bannerUrl: string }) => {
        if (!currentUser) return;
        const { data: newClub, error } = await supabase
            .from('clubs')
            .insert({ 
                name: newClubData.name, 
                description: newClubData.description, 
                banner_url: newClubData.bannerUrl || 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=2070&auto=format&fit=crop',
                created_by: currentUser.id
            })
            .select()
            .single();

        if (error) console.error("Error creating club:", error);
        else if (newClub) {
            await handleJoinClub(newClub.id); // Creator automatically joins
            fetchClubs();
            setIsCreatingClub(false);
        }
    };

    const handleUserSearch = async (query: string) => {
        if (!query) return;
        setIsSearchingUsers(true);
        setUserSearchResults([]);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`name.ilike.%${query}%,major.ilike.%${query}%`);
    
        if (error) {
            console.error('Error searching for users:', error);
        } else {
            setUserSearchResults(data?.filter(u => u.id !== currentUser?.id) || []);
        }
        setIsSearchingUsers(false);
    };

    const handleViewProfile = async (user: UserProfile) => {
        if (!currentUser) return;

        // Fetch follow stats for the user being viewed
        const { count: followerCount, error: followerError } = await supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id);
        const { count: followingCount, error: followingError } = await supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id);
        
        if (followerError || followingError) {
            console.error("Error fetching follow counts:", followerError || followingError);
        }

        const userWithStats: UserProfile = {
            ...user,
            followerCount: followerCount ?? 0,
            followingCount: followingCount ?? 0,
            isFollowedByCurrentUser: currentUser.following.includes(user.id)
        };

        setSelectedUser(userWithStats);
        setView('profile');
    };

    const handleFollowUser = async (userId: string) => {
        if (!currentUser) return;
        const { error } = await supabase.from('user_follows').insert({ follower_id: currentUser.id, following_id: userId });
        if (error) {
            console.error("Error following user:", error);
        } else {
            // Optimistic UI update
            setCurrentUser(prev => prev ? { ...prev, following: [...prev.following, userId] } : null);
            setSelectedUser(prev => prev ? { ...prev, followerCount: (prev.followerCount || 0) + 1, isFollowedByCurrentUser: true } : null);
        }
    };
    
    const handleUnfollowUser = async (userId: string) => {
        if (!currentUser) return;
        const { error } = await supabase.from('user_follows').delete().match({ follower_id: currentUser.id, following_id: userId });
        if (error) {
            console.error("Error unfollowing user:", error);
        } else {
            // Optimistic UI update
            setCurrentUser(prev => prev ? { ...prev, following: prev.following.filter(id => id !== userId) } : null);
            setSelectedUser(prev => prev ? { ...prev, followerCount: (prev.followerCount || 1) - 1, isFollowedByCurrentUser: false } : null);
        }
    };
    
    const filteredPosts = useMemo(() => {
        const feedFiltered = feedType === 'global' 
            ? posts
            : posts.filter(post => currentUser?.following.includes(post.author.id) || post.author.id === currentUser?.id);
            
        return feedFiltered.filter(post => {
            const categoryMatch = selectedCategory === 'All' || post.category === selectedCategory;
            const searchMatch = searchQuery.length === 0 ||
                post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.author.name.toLowerCase().includes(searchQuery.toLowerCase());
            return categoryMatch && searchMatch;
        });
    }, [posts, selectedCategory, searchQuery, feedType, currentUser]);

    if (!session || !currentUser) {
        return <AuthPage />;
    }

    const renderContent = () => {
        if (selectedPost) {
             return <div className="p-4"><PostCard post={selectedPost} currentUser={currentUser} onAddComment={handleAddComment} onReactToPost={handleReactToPost} onEditPost={setEditingPost} /></div>;
        }

        if (selectedClub) {
            const clubPosts = posts.filter(p => p.clubId === selectedClub.id);
            return <ClubPage 
                        club={selectedClub} 
                        posts={clubPosts}
                        currentUser={currentUser}
                        onBack={() => { setSelectedClub(null); setView('clubs'); }}
                        onJoinClub={handleJoinClub}
                        onLeaveClub={handleLeaveClub}
                        onSaveClub={handleSaveClub}
                        onAddComment={handleAddComment}
                        onReactToPost={handleReactToPost}
                        onEditPost={setEditingPost}
                        onTitleClick={setSelectedPost}
                    />;
        }

        switch(view) {
            case 'userSearch':
                return <UserSearchPage 
                            onSearch={handleUserSearch} 
                            results={userSearchResults} 
                            isLoading={isSearchingUsers} 
                            onViewProfile={handleViewProfile} 
                        />;
            case 'profile':
                const profileToShow = selectedUser || currentUser;
                const userPosts = posts.filter(p => p.author.id === profileToShow.id);
                const isOwnProfile = profileToShow.id === currentUser.id;
                return <ProfilePage 
                            user={profileToShow} 
                            posts={userPosts} 
                            currentUser={currentUser}
                            isOwnProfile={isOwnProfile}
                            onAddComment={handleAddComment} 
                            onReactToPost={handleReactToPost} 
                            onEditProfileClick={() => setEditingProfile(true)} 
                            onEditPost={setEditingPost}
                            onBack={!isOwnProfile ? () => { setSelectedUser(null); setView('userSearch'); } : undefined}
                            onFollow={handleFollowUser}
                            onUnfollow={handleUnfollowUser}
                        />;
            case 'clubs':
                return (
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Clubs & Organizations</h2>
                            <button
                                onClick={() => setIsCreatingClub(true)}
                                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                <DocumentAddIcon className="h-5 w-5" />
                                <span className="ml-2">Create Club</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {clubs.map(club => <ClubCard key={club.id} club={club} onClick={() => setSelectedClub(club)} />)}
                        </div>
                    </div>
                );
            case 'clubFeed': {
                const myClubIds = clubs.filter(c => c.members.includes(currentUser.id)).map(c => c.id);
                const myClubPosts = posts.filter(post => post.clubId && myClubIds.includes(post.clubId));
                
                const myClubs = clubs.filter(c => c.members.includes(currentUser.id));
                const postsByClub = myClubPosts.reduce((acc, post) => {
                    if (!post.clubId) return acc;
                    if (!acc[post.clubId]) acc[post.clubId] = [];
                    acc[post.clubId].push(post);
                    return acc;
                }, {} as Record<string, Post[]>);
            
                return (
                    <div className="p-4">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">My Club Feeds</h2>
                        {myClubPosts.length > 0 ? (
                            myClubs.map(club => {
                                const clubPostsForThisClub = postsByClub[club.id];
                                if (!clubPostsForThisClub || clubPostsForThisClub.length === 0) return null;
                                return (
                                    <div key={club.id} className="mb-8">
                                        <div className="pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
                                            <button 
                                                onClick={() => setSelectedClub(club)}
                                                className="text-2xl font-bold text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                                            >
                                                {club.name}
                                            </button>
                                        </div>
                                        {clubPostsForThisClub.map(post => (
                                            <PostCard key={post.id} post={post} currentUser={currentUser} onAddComment={handleAddComment} onReactToPost={handleReactToPost} onEditPost={setEditingPost} onTitleClick={setSelectedPost} />
                                        ))}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Your club feed is empty!</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">Join some clubs to see their posts here.</p>
                                <button
                                    onClick={() => handleNavigate('clubs')}
                                    className="mt-4 flex items-center mx-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    <UsersIcon className="h-5 w-5" />
                                    <span className="ml-2">Discover Clubs</span>
                                </button>
                            </div>
                        )}
                    </div>
                );
            }
            case 'feed':
            default:
                return (
                    <div className="p-4">
                        <PostForm onNewPost={handleNewPost} onSaveDraft={handleSaveDraft} currentUser={currentUser} />
                        <div className="my-4">
                           <FeedToggle currentFeed={feedType} onSetFeed={setFeedType} />
                           <FilterTabs selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
                        </div>
                        {isLoading ? <FeedSpinner /> : filteredPosts.map(post => (
                            <PostCard key={post.id} post={post} currentUser={currentUser} onAddComment={handleAddComment} onReactToPost={handleReactToPost} onEditPost={setEditingPost} onTitleClick={setSelectedPost} />
                        ))}
                         {!isLoading && filteredPosts.length === 0 && (
                            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Your feed is looking a little empty.</h3>
                                {feedType === 'following' ? (
                                    <p className="text-gray-500 dark:text-gray-400 mt-2">Follow some people or switch to the "Global" feed to see more posts.</p>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 mt-2">There are no posts matching your filters. Try another category!</p>
                                )}
                            </div>
                        )}
                    </div>
                );
        }
    }

    return (
        <ThemeProvider>
            <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
                <Header onNavigate={handleNavigate} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
                <main className="container mx-auto max-w-4xl">
                    {isLoading && view === 'feed' ? <FeedSpinner /> : renderContent()}
                </main>
                {editingProfile && currentUser && <EditProfileModal user={currentUser} onClose={() => setEditingProfile(false)} onSave={handleSaveProfile} />}
                {editingPost && <EditPostModal post={editingPost} onClose={() => setEditingPost(null)} onSave={handleSavePost} />}
                {isCreatingClub && <CreateClubModal onClose={() => setIsCreatingClub(false)} onCreate={handleCreateClub} />}
            </div>
        </ThemeProvider>
    );
}

export default App;