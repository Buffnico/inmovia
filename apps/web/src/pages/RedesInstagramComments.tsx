import React, { useState, useEffect } from 'react';
import { InstagramAccount, getFeedPosts, getPostComments, sendCommentReply, IgPost, IgComment } from '../services/instagramService';

interface Props {
    account: InstagramAccount;
}

export default function RedesInstagramComments({ account }: Props) {
    const [posts, setPosts] = useState<IgPost[]>([]);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [comments, setComments] = useState<IgComment[]>([]);
    const [replyText, setReplyText] = useState("");
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);

    // Mobile view state
    const [mobileDetailActive, setMobileDetailActive] = useState(false);

    useEffect(() => {
        loadPosts();
    }, [account.id]);

    useEffect(() => {
        if (selectedPostId) {
            loadComments(selectedPostId);
            setMobileDetailActive(true);
        } else {
            setComments([]);
            setMobileDetailActive(false);
        }
    }, [selectedPostId]);

    const loadPosts = async () => {
        setLoadingPosts(true);
        try {
            const data = await getFeedPosts(account.id);
            setPosts(data);
            if (data.length > 0 && !selectedPostId) {
                // On desktop, select first by default if none selected
                if (window.innerWidth > 768) {
                    setSelectedPostId(data[0].id);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const loadComments = async (postId: string) => {
        setLoadingComments(true);
        try {
            const data = await getPostComments(account.id, postId);
            setComments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPostId || !replyText.trim()) return;

        try {
            const newComment = await sendCommentReply(account.id, selectedPostId, 'temp_id', replyText);
            setComments([...comments, newComment]);
            setReplyText("");
        } catch (error) {
            console.error(error);
            alert("Error al enviar respuesta");
        }
    };

    const handleIvoSuggest = () => {
        // Mock Ivo-t suggestion
        setReplyText("¡Hola! Gracias por tu interés. Te enviamos más info por privado. 🏠✨");
    };

    const handleBackToList = () => {
        setMobileDetailActive(false);
        setSelectedPostId(null);
    };

    const selectedPost = posts.find(p => p.id === selectedPostId);

    return (
        <div className={`comments-layout ${mobileDetailActive ? 'mobile-detail-active' : ''}`}>
            {/* Sidebar: Posts Selector */}
            <div className="comments-list">
                <div className="redes-panel-header">
                    <h6 className="redes-panel-title" style={{ fontSize: '1rem' }}>Publicaciones</h6>
                </div>
                {loadingPosts ? (
                    <div className="p-4 text-center text-muted">Cargando...</div>
                ) : (
                    <div className="d-flex flex-column">
                        {posts.map(post => (
                            <div
                                key={post.id}
                                className={`comment-post-item ${selectedPostId === post.id ? 'active' : ''}`}
                                onClick={() => setSelectedPostId(post.id)}
                            >
                                <img src={post.mediaUrl} alt="" className="comment-post-thumb" />
                                <div style={{ overflow: 'hidden', flex: 1 }}>
                                    <div className="text-truncate small fw-bold mb-1 text-dark">{post.caption}</div>
                                    <div className="d-flex align-items-center gap-3 small text-muted">
                                        <span>💬 {post.commentCount}</span>
                                        <span>❤️ {post.likeCount}</span>
                                    </div>
                                    <div className="small text-muted mt-1" style={{ fontSize: '0.7rem' }}>
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main: Comments Thread */}
            <div className="comments-detail">
                {selectedPostId ? (
                    <>
                        <div className="redes-panel-header py-2 px-3" style={{ height: '60px' }}>
                            <button className="btn btn-sm btn-light d-md-none rounded-circle me-2" onClick={handleBackToList}>←</button>
                            <h6 className="m-0 fw-bold text-dark">Comentarios</h6>
                            {selectedPost && (
                                <span className="badge bg-light text-dark border ms-auto d-none d-md-inline-block">
                                    Post ID: {selectedPost.id.slice(0, 8)}...
                                </span>
                            )}
                        </div>

                        <div className="comments-timeline">
                            {loadingComments ? (
                                <div className="text-center p-5 text-muted">Cargando comentarios...</div>
                            ) : comments.length === 0 ? (
                                <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted opacity-50">
                                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💬</div>
                                    <p>No hay comentarios aún.</p>
                                </div>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className={`comment-bubble ${comment.authorName === 'Yo' ? 'flex-row-reverse' : ''}`}>
                                        <div className="comment-avatar d-flex align-items-center justify-content-center bg-light border fw-bold text-primary">
                                            {comment.authorName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className={`comment-content ${comment.authorName === 'Yo' ? 'own' : ''}`}>
                                            <div className="comment-author">{comment.authorName}</div>
                                            <div className="comment-text">{comment.text}</div>
                                            <div className="comment-meta">
                                                {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Reply Box */}
                        <div className="reply-panel">
                            {account.ivoSettings?.suggestMode && (
                                <div className="mb-2 d-flex justify-content-end">
                                    <button
                                        className="btn btn-sm text-white rounded-pill px-3 d-flex align-items-center gap-2 shadow-sm"
                                        onClick={handleIvoSuggest}
                                        type="button"
                                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}
                                    >
                                        <span>✨</span> Sugerir respuesta con Ivo-t
                                    </button>
                                </div>
                            )}
                            <form onSubmit={handleReply} className="d-flex gap-2 align-items-end">
                                <div className="flex-grow-1 position-relative">
                                    <textarea
                                        className="form-control"
                                        placeholder="Escribe una respuesta..."
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        rows={2}
                                        style={{ resize: 'none', borderRadius: '12px', paddingRight: '40px' }}
                                    />
                                    <button type="button" className="btn btn-link position-absolute bottom-0 end-0 text-decoration-none text-muted" style={{ fontSize: '1.2rem' }}>😊</button>
                                </div>
                                <button type="submit" className="btn btn-primary rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: 42, height: 42 }} disabled={!replyText.trim()}>
                                    ➤
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted bg-light">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>👈</div>
                        <p>Seleccioná una publicación para ver sus comentarios.</p>
                        <p className="small text-muted mt-2">En la versión final, esta vista se conectará a Instagram Business.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
