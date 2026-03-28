'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { 
  Baseball, Trophy, Users, Calendar, Zap, Target, Crown, Star, CheckCircle2,
  MessageCircle, Send, Circle, X, Shield, Activity, Ban, UserCheck, Trash2,
  Plus, AlertTriangle, Bell, Flag, AlertOctagon, Eye, EyeOff, Clock
} from 'lucide-react'

// Interfaces
interface Team { id: string; name: string; shortName: string; city: string; division: string; logo: string; wins: number; losses: number }
interface Game { id: string; homeTeam: Team; awayTeam: Team; gameDate: string; stadium: string | null; status: string; homeScore: number | null; awayScore: number | null; _count?: { predictions: number } }
interface Prediction { id: string; gameId: string; predictedWinnerId: string; points: number; isCorrect: boolean | null }
interface User { id: string; name: string; email: string; totalPoints: number; role?: string; status?: string; createdAt?: string; _count?: { predictions: number; sentMessages: number } }
interface Ranking { id: string; name: string; totalPoints: number; rank: number }
interface Message { id: string; content: string; senderId: string; sender: { id: string; name: string }; createdAt: string; receiverId?: string }
interface OnlineUser { id: string; name: string; socketId: string }
interface Notification { id: string; type: string; title: string; message: string; data?: string; read: boolean; createdAt: string }
interface Report { id: string; reason: string; description?: string; status: string; reporter: { id: string; name: string }; reportedUser: { id: string; name: string; status: string }; createdAt: string }
interface CheatAlert { id: string; type: string; severity: string; description: string; resolved: boolean; user: { id: string; name: string; email: string }; createdAt: string }

export default function MLBFantasyApp() {
  // State
  const [user, setUser] = useState<User | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPrediction, setSelectedPrediction] = useState<Record<string, string>>({})
  const [userName, setUserName] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)

  // Chat state
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [privateMessages, setPrivateMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [chatMode, setChatMode] = useState<'public' | 'private'>('public')
  const [selectedPrivateUser, setSelectedPrivateUser] = useState<OnlineUser | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  // Admin state
  const [showAdmin, setShowAdmin] = useState(false)
  const [adminUsers, setAdminUsers] = useState<User[]>([])
  const [adminGames, setAdminGames] = useState<Game[]>([])
  const [activityLogs, setActivityLogs] = useState<unknown[]>([])
  const [announcements, setAnnouncements] = useState<unknown[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [cheatAlerts, setCheatAlerts] = useState<CheatAlert[]>([])
  const [adminTab, setAdminTab] = useState('users')
  const [newGameData, setNewGameData] = useState({ homeTeamId: '', awayTeamId: '', gameDate: '', stadium: '' })

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportingUser, setReportingUser] = useState<User | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [reportDescription, setReportDescription] = useState('')

  // Load initial data
  useEffect(() => { loadData() }, [])

  // Socket connection
  useEffect(() => {
    if (user && !socket) {
      const newSocket = io('/?XTransformPort=3003')
      
      newSocket.on('connect', () => {
        newSocket.emit('join', { userId: user.id, userName: user.name })
      })

      newSocket.on('recent-messages', (msgs: Message[]) => setMessages(msgs))
      newSocket.on('new-message', (msg: Message) => setMessages(prev => [...prev, msg]))
      newSocket.on('new-private-message', (msg: Message) => {
        setPrivateMessages(prev => [...prev, msg])
        if (msg.senderId !== user.id) {
          toast({ title: `📩 Mensaje de ${msg.sender.name}`, description: msg.content.substring(0, 50) })
        }
      })
      newSocket.on('users-online', (users: OnlineUser[]) => setOnlineUsers(users))
      newSocket.on('user-typing', (data: { userName: string }) => {
        setTypingUser(data.userName)
        setTimeout(() => setTypingUser(null), 3000)
      })
      newSocket.on('user-joined', (data: { userName: string }) => toast({ title: `${data.userName} se unió`, duration: 2000 }))
      newSocket.on('user-left', (data: { userName: string }) => toast({ title: `${data.userName} salió`, duration: 2000 }))
      newSocket.on('warning', (data: { message: string }) => toast({ title: '⚠️ Advertencia', description: data.message, variant: 'destructive' }))
      newSocket.on('cheat-alert', (alert: CheatAlert) => {
        toast({ title: '🚨 Alerta de Trampa', description: alert.description, variant: 'destructive' })
        loadAdminData()
      })

      setSocket(newSocket)
    }
    return () => { if (socket) socket.disconnect() }
  }, [user])

  // Scroll to bottom on new messages
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, privateMessages])

  // Load notifications
  useEffect(() => {
    if (user) loadNotifications()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const userRes = await fetch('/api/user')
      const userData = await userRes.json()
      setUser(userData)
      
      const [teamsRes, gamesRes, rankingsRes] = await Promise.all([
        fetch('/api/mlb/teams'),
        fetch('/api/mlb/games'),
        fetch('/api/mlb/rankings')
      ])
      
      setTeams(await teamsRes.json())
      setGames(await gamesRes.json())
      setRankings(await rankingsRes.json())
      
      if (userData?.id) {
        const predictionsRes = await fetch(`/api/mlb/predictions?userId=${userData.id}`)
        setPredictions(await predictionsRes.json())
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar los datos', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const loadNotifications = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/notifications?userId=${user.id}`)
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const loadAdminData = async () => {
    if (!user || user.role !== 'admin') return
    try {
      const [usersRes, gamesRes, reportsRes, alertsRes] = await Promise.all([
        fetch(`/api/admin/users?adminId=${user.id}`),
        fetch(`/api/admin/games?adminId=${user.id}`),
        fetch(`/api/reports?adminId=${user.id}`),
        fetch(`/api/cheat-detection?adminId=${user.id}&unresolved=true`)
      ])
      setAdminUsers(await usersRes.json())
      setAdminGames(await gamesRes.json())
      setReports(await reportsRes.json())
      setCheatAlerts(await alertsRes.json())
    } catch (error) {
      console.error('Error loading admin data:', error)
    }
  }

  const handleUserAction = async (userId: string, action: string, value?: string) => {
    if (!user) return
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: user.id, userId, action, value })
      })
      toast({ title: 'Usuario actualizado' })
      loadAdminData()
      loadData()
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' })
    }
  }

  const handleGameAction = async (gameId: string, action: string, data?: Record<string, unknown>) => {
    if (!user) return
    try {
      await fetch('/api/admin/games', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: user.id, gameId, action, ...data })
      })
      toast({ title: 'Partido actualizado' })
      loadAdminData()
      loadData()
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const handleCreateGame = async () => {
    if (!user || !newGameData.homeTeamId || !newGameData.awayTeamId || !newGameData.gameDate) return
    try {
      await fetch('/api/admin/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: user.id, ...newGameData })
      })
      toast({ title: 'Partido creado' })
      setNewGameData({ homeTeamId: '', awayTeamId: '', gameDate: '', stadium: '' })
      loadAdminData()
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const handlePrediction = async (gameId: string, winnerId: string) => {
    if (!user) return
    setSelectedPrediction(prev => ({ ...prev, [gameId]: winnerId }))
    try {
      const res = await fetch('/api/mlb/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, gameId, predictedWinnerId: winnerId })
      })
      
      // Check for cheat detection
      const data = await res.json()
      if (data.cheatAlert) {
        toast({ title: '⚠️ Actividad detectada', description: 'Se ha detectado actividad inusual', variant: 'destructive' })
      }
      
      setPredictions(prev => {
        const existing = prev.findIndex(p => p.gameId === gameId)
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = data
          return updated
        }
        return [...prev, data]
      })
      toast({ title: '¡Predicción guardada!' })
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const handleReport = async () => {
    if (!user || !reportingUser || !reportReason) return
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reporterId: user.id, reportedUserId: reportingUser.id, reason: reportReason, description: reportDescription })
      })
      toast({ title: 'Reporte enviado', description: 'Gracias por ayudar a mantener la comunidad' })
      setShowReportModal(false)
      setReportReason('')
      setReportDescription('')
    } catch (error) {
      toast({ title: 'Error al enviar reporte', variant: 'destructive' })
    }
  }

  const handleResolveReport = async (reportId: string, status: string) => {
    if (!user) return
    try {
      await fetch('/api/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: user.id, reportId, status, resolution: 'Revisado por admin' })
      })
      toast({ title: 'Reporte actualizado' })
      loadAdminData()
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const handleResolveCheatAlert = async (alertId: string, action: 'dismiss' | 'warn' | 'ban') => {
    if (!user) return
    try {
      await fetch('/api/cheat-detection', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: user.id, alertId, action })
      })
      toast({ title: `Alerta ${action === 'ban' ? 'resuelta con ban' : action === 'warn' ? 'resuelta con advertencia' : 'descartada'}` })
      loadAdminData()
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const markNotificationsRead = async () => {
    if (!user) return
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, markAllRead: true })
    })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !socket || !user) return
    if (chatMode === 'private' && selectedPrivateUser) {
      socket.emit('send-message', { content: newMessage.trim(), senderId: user.id, senderName: user.name, receiverId: selectedPrivateUser.id, isPrivate: true })
    } else {
      socket.emit('send-message', { content: newMessage.trim(), senderId: user.id, senderName: user.name })
    }
    setNewMessage('')
  }, [newMessage, socket, user, chatMode, selectedPrivateUser])

  const updateUserName = async () => {
    if (!user || !userName.trim()) return
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName, email: user.email, userId: user.id })
      })
      setUser(await res.json())
      setShowNameInput(false)
      toast({ title: 'Nombre actualizado' })
    } catch (error) {
      console.error(error)
    }
  }

  // Load admin data when admin panel opens
  useEffect(() => {
    if (showAdmin && user?.role === 'admin') loadAdminData()
  }, [showAdmin, user])

  // Helper functions
  const formatGameTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  const formatDateTime = (dateStr: string) => new Date(dateStr).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  const getTeamWinPercentage = (team: Team) => { const t = team.wins + team.losses; return t > 0 ? ((team.wins / t) * 100).toFixed(1) : '0.0' }
  const hasPredicted = (gameId: string) => predictions.some(p => p.gameId === gameId) || selectedPrediction[gameId]
  const getPredictedTeam = (gameId: string) => predictions.find(p => p.gameId === gameId)?.predictedWinnerId || selectedPrediction[gameId] || null

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Baseball className="w-16 h-16 mx-auto mb-4 animate-spin" />
          <p className="text-xl">Cargando MLB Fantasy...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg"><Baseball className="w-8 h-8 text-white" /></div>
              <div><h1 className="text-2xl font-bold text-white">MLB Fantasy</h1><p className="text-green-200 text-sm">Predice y gana</p></div>
            </div>
            
            <div className="flex items-center gap-3">
              {user?.role === 'admin' && (
                <Button onClick={() => setShowAdmin(!showAdmin)} className="bg-red-600 hover:bg-red-700"><Shield className="w-5 h-5 mr-2" />Admin</Button>
              )}
              
              {/* Notifications */}
              <Button onClick={() => { setShowNotifications(!showNotifications); setShowChat(false) }} className="relative bg-blue-600 hover:bg-blue-700">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-xs">{unreadCount}</Badge>}
              </Button>
              
              {/* Chat */}
              <Button onClick={() => { setShowChat(!showChat); setShowNotifications(false) }} className="relative bg-green-600 hover:bg-green-700">
                <MessageCircle className="w-5 h-5" />
                {onlineUsers.length > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-yellow-500 text-xs">{onlineUsers.length}</Badge>}
              </Button>
              
              {user && (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold">{user.name}</p>
                      {user.role === 'admin' && <Badge className="bg-red-500 text-xs">ADMIN</Badge>}
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400"><Star className="w-4 h-4" /><span className="text-sm font-bold">{user.totalPoints} pts</span></div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowNameInput(true)} className="text-white/70 hover:text-white">Editar</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed right-0 top-0 h-full w-80 bg-gray-900 border-l border-white/10 shadow-2xl z-50 flex flex-col">
          <div className="bg-blue-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2"><Bell className="w-5 h-5 text-white" /><h3 className="text-white font-bold">Notificaciones</h3></div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && <Button size="sm" onClick={markNotificationsRead} className="bg-blue-600 text-xs">Marcar leídas</Button>}
              <Button variant="ghost" size="sm" onClick={() => setShowNotifications(false)} className="text-white"><X className="w-5 h-5" /></Button>
            </div>
          </div>
          <ScrollArea className="flex-1 p-4">
            {notifications.length === 0 ? (
              <div className="text-center text-white/50 py-8"><Bell className="w-12 h-12 mx-auto mb-2 opacity-50" /><p>No hay notificaciones</p></div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-3 rounded-lg ${n.read ? 'bg-white/5' : 'bg-blue-500/20 border border-blue-500/30'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-semibold text-sm">{n.title}</p>
                        <p className="text-white/70 text-xs mt-1">{n.message}</p>
                      </div>
                      {!n.read && <Circle className="w-2 h-2 fill-blue-400 text-blue-400" />}
                    </div>
                    <p className="text-white/50 text-xs mt-2">{formatDateTime(n.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}

      {/* Chat Panel */}
      {showChat && (
        <div className="fixed right-0 top-0 h-full w-80 bg-gray-900 border-l border-white/10 shadow-2xl z-50 flex flex-col">
          <div className="bg-green-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2"><MessageCircle className="w-5 h-5 text-white" /><h3 className="text-white font-bold">Chat</h3></div>
            <Button variant="ghost" size="sm" onClick={() => setShowChat(false)} className="text-white"><X className="w-5 h-5" /></Button>
          </div>
          
          {/* Chat Mode Tabs */}
          <div className="flex border-b border-white/10">
            <Button onClick={() => setChatMode('public')} className={`flex-1 rounded-none ${chatMode === 'public' ? 'bg-green-600' : 'bg-transparent text-white/70'}`}>Público</Button>
            <Button onClick={() => setChatMode('private')} className={`flex-1 rounded-none ${chatMode === 'private' ? 'bg-green-600' : 'bg-transparent text-white/70'}`}>Privado</Button>
          </div>
          
          {chatMode === 'private' && (
            <div className="p-2 border-b border-white/10">
              <p className="text-white/50 text-xs mb-2">Usuarios en línea:</p>
              <ScrollArea className="h-20">
                <div className="flex flex-wrap gap-2">
                  {onlineUsers.filter(u => u.id !== user?.id).map((ou) => (
                    <Button key={ou.socketId} size="sm" onClick={() => setSelectedPrivateUser(ou)} className={`${selectedPrivateUser?.id === ou.id ? 'bg-green-500' : 'bg-white/10'} text-xs`}>
                      {ou.name}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          
          {/* Online Users (Public mode) */}
          {chatMode === 'public' && (
            <div className="bg-black/30 p-2 border-b border-white/10">
              <ScrollArea className="h-12">
                <div className="flex flex-wrap gap-2">
                  {onlineUsers.map((ou) => (
                    <Badge key={ou.socketId} variant="outline" className="border-green-500/50 text-green-300 text-xs">
                      <Circle className="w-2 h-2 mr-1 fill-green-400 text-green-400" />{ou.name}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {(chatMode === 'private' && selectedPrivateUser ? privateMessages.filter(m => m.senderId === selectedPrivateUser.id || m.receiverId === selectedPrivateUser.id) : messages).map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-lg p-3 ${msg.senderId === user?.id ? 'bg-green-600 text-white' : 'bg-white/10 text-white'}`}>
                    <p className="text-xs font-semibold opacity-70 mb-1">{msg.senderId === user?.id ? 'Tú' : msg.sender.name}</p>
                    <p className="text-sm break-words">{msg.content}</p>
                    <p className="text-xs opacity-50 mt-1">{formatGameTime(msg.createdAt)}</p>
                  </div>
                </div>
              ))}
              {typingUser && chatMode === 'public' && <p className="text-white/50 text-xs italic">{typingUser} está escribiendo...</p>}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Message Input */}
          <div className="p-4 border-t border-white/10 bg-black/30">
            {chatMode === 'private' && !selectedPrivateUser && (
              <p className="text-white/50 text-xs text-center mb-2">Selecciona un usuario para chatear</p>
            )}
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => { setNewMessage(e.target.value); socket?.emit('typing', { userId: user?.id, userName: user?.name }) }}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={chatMode === 'private' && selectedPrivateUser ? `Mensaje a ${selectedPrivateUser.name}...` : "Escribe un mensaje..."}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                disabled={chatMode === 'private' && !selectedPrivateUser}
              />
              <Button onClick={sendMessage} disabled={chatMode === 'private' && !selectedPrivateUser} className="bg-green-600 hover:bg-green-700"><Send className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {showAdmin && user?.role === 'admin' && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Card className="bg-red-900/30 border-red-500/30 backdrop-blur-sm mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2"><Shield className="w-5 h-5 text-red-400" />Panel de Administración</CardTitle>
                  <CardDescription className="text-red-200">Gestiona usuarios, partidos y supervisa la actividad</CardDescription>
                </div>
                {/* Cheat Alerts Badge */}
                {cheatAlerts.filter(a => !a.resolved).length > 0 && (
                  <Badge className="bg-red-500 animate-pulse text-lg px-4 py-2">
                    <AlertOctagon className="w-5 h-5 mr-2" />
                    {cheatAlerts.filter(a => !a.resolved).length} Alertas de Trampa
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={adminTab} onValueChange={setAdminTab} className="space-y-4">
                <TabsList className="bg-black/30 border border-white/10 flex-wrap">
                  <TabsTrigger value="alerts" className="data-[state=active]:bg-red-500/30 text-white">
                    <AlertOctagon className="w-4 h-4 mr-2" />Alertas ({cheatAlerts.filter(a => !a.resolved).length})
                  </TabsTrigger>
                  <TabsTrigger value="reports" className="data-[state=active]:bg-red-500/30 text-white">
                    <Flag className="w-4 h-4 mr-2" />Reportes ({reports.filter(r => r.status === 'pending').length})
                  </TabsTrigger>
                  <TabsTrigger value="users" className="data-[state=active]:bg-red-500/30 text-white">
                    <Users className="w-4 h-4 mr-2" />Usuarios ({adminUsers.length})
                  </TabsTrigger>
                  <TabsTrigger value="games" className="data-[state=active]:bg-red-500/30 text-white">
                    <Calendar className="w-4 h-4 mr-2" />Partidos
                  </TabsTrigger>
                </TabsList>

                {/* Cheat Alerts Tab */}
                <TabsContent value="alerts">
                  <div className="space-y-4">
                    {cheatAlerts.length === 0 ? (
                      <div className="text-center py-8 text-white/50"><CheckCircle2 className="w-12 h-12 mx-auto mb-2" /><p>No hay alertas activas</p></div>
                    ) : (
                      cheatAlerts.map((alert) => (
                        <Card key={alert.id} className={`bg-white/5 border-white/10 ${alert.resolved ? 'opacity-50' : alert.severity === 'critical' ? 'border-red-500' : alert.severity === 'high' ? 'border-orange-500' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={alert.severity === 'critical' ? 'bg-red-500' : alert.severity === 'high' ? 'bg-orange-500' : alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}>
                                    {alert.severity.toUpperCase()}
                                  </Badge>
                                  <Badge variant="outline" className="border-white/20 text-white">{alert.type.replace('_', ' ')}</Badge>
                                  {alert.resolved && <Badge className="bg-green-500">Resuelto</Badge>}
                                </div>
                                <p className="text-white">{alert.description}</p>
                                <p className="text-white/50 text-sm mt-1">Usuario: <span className="font-semibold">{alert.user.name}</span> ({alert.user.email})</p>
                                <p className="text-white/50 text-xs mt-1"><Clock className="w-3 h-3 inline mr-1" />{formatDateTime(alert.createdAt)}</p>
                              </div>
                              {!alert.resolved && (
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => handleResolveCheatAlert(alert.id, 'dismiss')} className="border-gray-500 text-gray-400">Ignorar</Button>
                                  <Button size="sm" variant="outline" onClick={() => handleResolveCheatAlert(alert.id, 'warn')} className="border-yellow-500 text-yellow-400">Advertir</Button>
                                  <Button size="sm" variant="outline" onClick={() => handleResolveCheatAlert(alert.id, 'ban')} className="border-red-500 text-red-400"><Ban className="w-4 h-4 mr-1" />Banear</Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                {/* Reports Tab */}
                <TabsContent value="reports">
                  <div className="space-y-4">
                    {reports.length === 0 ? (
                      <div className="text-center py-8 text-white/50"><Flag className="w-12 h-12 mx-auto mb-2" /><p>No hay reportes</p></div>
                    ) : (
                      reports.map((report) => (
                        <Card key={report.id} className={`bg-white/5 border-white/10 ${report.status === 'pending' ? 'border-yellow-500' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={report.status === 'pending' ? 'bg-yellow-500' : report.status === 'resolved' ? 'bg-green-500' : 'bg-gray-500'}>
                                    {report.status.toUpperCase()}
                                  </Badge>
                                  <Badge variant="outline" className="border-white/20 text-white">{report.reason}</Badge>
                                </div>
                                <p className="text-white text-sm">{report.description || 'Sin descripción'}</p>
                                <div className="flex items-center gap-4 mt-2 text-white/50 text-xs">
                                  <span>Reportador: <span className="text-white">{report.reporter.name}</span></span>
                                  <span>Reportado: <span className="text-white font-semibold">{report.reportedUser.name}</span> ({report.reportedUser.status})</span>
                                </div>
                                <p className="text-white/50 text-xs mt-1">{formatDateTime(report.createdAt)}</p>
                              </div>
                              {report.status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => handleResolveReport(report.id, 'dismissed')} className="border-gray-500 text-gray-400">Descartar</Button>
                                  <Button size="sm" variant="outline" onClick={() => handleResolveReport(report.id, 'resolved')} className="border-green-500 text-green-400">Resolver</Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users">
                  <div className="space-y-4">
                    {adminUsers.map((u) => (
                      <Card key={u.id} className={`bg-white/5 border-white/10 ${u.status === 'banned' ? 'opacity-50' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl">👤</div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-white font-semibold">{u.name}</p>
                                  {u.role === 'admin' && <Badge className="bg-red-500 text-xs">ADMIN</Badge>}
                                  {u.status === 'banned' && <Badge className="bg-gray-500 text-xs">BANEADO</Badge>}
                                  {u.status === 'suspended' && <Badge className="bg-yellow-500 text-xs">SUSPENDIDO</Badge>}
                                </div>
                                <p className="text-white/50 text-sm">{u.email}</p>
                                <div className="flex items-center gap-4 mt-1 text-xs text-white/70">
                                  <span>⭐ {u.totalPoints} pts</span>
                                  <span>🎯 {u._count?.predictions || 0} pred.</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {u.role !== 'admin' && (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => { setReportingUser(u); setShowReportModal(true) }} className="border-yellow-500 text-yellow-400"><Flag className="w-4 h-4" /></Button>
                                  {u.status === 'active' ? (
                                    <Button size="sm" variant="outline" onClick={() => handleUserAction(u.id, 'setStatus', 'banned')} className="border-red-500 text-red-400"><Ban className="w-4 h-4" /></Button>
                                  ) : (
                                    <Button size="sm" variant="outline" onClick={() => handleUserAction(u.id, 'setStatus', 'active')} className="border-green-500 text-green-400"><UserCheck className="w-4 h-4" /></Button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Games Tab */}
                <TabsContent value="games">
                  <Card className="bg-white/5 border-white/10 mb-4">
                    <CardHeader><CardTitle className="text-white text-lg">Crear Nuevo Partido</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Select value={newGameData.homeTeamId} onValueChange={(v) => setNewGameData(prev => ({ ...prev, homeTeamId: v }))}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue placeholder="Local" /></SelectTrigger>
                          <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.shortName}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={newGameData.awayTeamId} onValueChange={(v) => setNewGameData(prev => ({ ...prev, awayTeamId: v }))}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue placeholder="Visitante" /></SelectTrigger>
                          <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.shortName}</SelectItem>)}</SelectContent>
                        </Select>
                        <Input type="datetime-local" value={newGameData.gameDate} onChange={(e) => setNewGameData(prev => ({ ...prev, gameDate: e.target.value }))} className="bg-white/10 border-white/20 text-white" />
                        <Button onClick={handleCreateGame} className="bg-green-600 hover:bg-green-700"><Plus className="w-4 h-4 mr-2" />Crear</Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="space-y-4">
                    {adminGames.map((g) => (
                      <Card key={g.id} className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-center"><span className="text-2xl">{g.awayTeam.logo}</span><p className="text-white font-bold">{g.awayTeam.shortName}</p></div>
                              <div className="text-center px-4">
                                <p className="text-white/50 text-sm">{formatDateTime(g.gameDate)}</p>
                                <p className="text-white font-bold">VS</p>
                                <Badge className={g.status === 'live' ? 'bg-red-500' : g.status === 'finished' ? 'bg-gray-500' : 'bg-green-500'}>{g.status.toUpperCase()}</Badge>
                              </div>
                              <div className="text-center"><span className="text-2xl">{g.homeTeam.logo}</span><p className="text-white font-bold">{g.homeTeam.shortName}</p></div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-center"><p className="text-white/50 text-xs">Predicciones</p><p className="text-white font-bold">{g._count?.predictions || 0}</p></div>
                              <div className="flex gap-2">
                                {g.status === 'scheduled' && <Button size="sm" onClick={() => handleGameAction(g.id, 'setStatus', { status: 'live' })} className="bg-red-600">Iniciar</Button>}
                                {g.status === 'live' && (
                                  <>
                                    <Button size="sm" variant="outline" onClick={() => {
                                      const home = prompt('Score local:', '0')
                                      const away = prompt('Score visitante:', '0')
                                      if (home && away) handleGameAction(g.id, 'setScore', { homeScore: parseInt(home), awayScore: parseInt(away) })
                                    }} className="border-white/20 text-white">Score</Button>
                                    <Button size="sm" variant="outline" onClick={() => {
                                      const winner = confirm(`${g.homeTeam.shortName} ganó?`)
                                      handleGameAction(g.id, 'setWinner', { winnerId: winner ? g.homeTeamId : g.awayTeamId })
                                    }} className="border-green-500 text-green-400">Finalizar</Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="games" className="space-y-6">
          <TabsList className="bg-black/30 border border-white/10 w-full justify-start">
            <TabsTrigger value="games" className="data-[state=active]:bg-white/20 text-white"><Calendar className="w-4 h-4 mr-2" />Partidos</TabsTrigger>
            <TabsTrigger value="rankings" className="data-[state=active]:bg-white/20 text-white"><Trophy className="w-4 h-4 mr-2" />Rankings</TabsTrigger>
            <TabsTrigger value="teams" className="data-[state=active]:bg-white/20 text-white"><Users className="w-4 h-4 mr-2" />Equipos</TabsTrigger>
          </TabsList>

          <TabsContent value="games">
            <Card className="bg-black/30 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" />Partidos de Hoy</CardTitle>
                <CardDescription className="text-green-200">Haz tus predicciones y gana puntos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {games.map((game) => (
                    <Card key={game.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={game.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-white/20'}>{game.status === 'live' ? '🔴 EN VIVO' : formatGameTime(game.gameDate)}</Badge>
                          <span className="text-white/50 text-sm">{game.stadium}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <button onClick={() => handlePrediction(game.id, game.awayTeam.id)} disabled={game.status !== 'scheduled'} className={`flex-1 p-4 rounded-lg transition-all ${getPredictedTeam(game.id) === game.awayTeam.id ? 'bg-green-500/30 border-2 border-green-400' : 'bg-white/5 hover:bg-white/10 border-2 border-transparent'} ${game.status !== 'scheduled' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <div className="text-center">
                              <span className="text-3xl">{game.awayTeam.logo}</span>
                              <p className="text-white font-bold mt-2">{game.awayTeam.shortName}</p>
                              <p className="text-white/70 text-sm">{game.awayTeam.wins}W - {game.awayTeam.losses}L</p>
                              {game.status === 'live' && <p className="text-2xl font-bold text-white mt-2">{game.awayScore}</p>}
                            </div>
                          </button>
                          <div className="px-4 text-center"><span className="text-white/30 font-bold text-xl">VS</span></div>
                          <button onClick={() => handlePrediction(game.id, game.homeTeam.id)} disabled={game.status !== 'scheduled'} className={`flex-1 p-4 rounded-lg transition-all ${getPredictedTeam(game.id) === game.homeTeam.id ? 'bg-green-500/30 border-2 border-green-400' : 'bg-white/5 hover:bg-white/10 border-2 border-transparent'} ${game.status !== 'scheduled' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <div className="text-center">
                              <span className="text-3xl">{game.homeTeam.logo}</span>
                              <p className="text-white font-bold mt-2">{game.homeTeam.shortName}</p>
                              <p className="text-white/70 text-sm">{game.homeTeam.wins}W - {game.homeTeam.losses}L</p>
                              {game.status === 'live' && <p className="text-2xl font-bold text-white mt-2">{game.homeScore}</p>}
                            </div>
                          </button>
                        </div>
                        {hasPredicted(game.id) && game.status === 'scheduled' && (
                          <div className="mt-3 text-center"><Badge className="bg-green-500/20 text-green-300"><CheckCircle2 className="w-3 h-3 mr-1" />Predicción realizada</Badge></div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rankings">
            <Card className="bg-black/30 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2"><Crown className="w-5 h-5 text-yellow-400" />Clasificación Global</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rankings.map((player, index) => (
                    <div key={player.id} className={`flex items-center justify-between p-4 rounded-lg ${index < 3 ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-white/5'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-gray-400 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-white'}`}>{index + 1}</div>
                        <div>
                          <p className="text-white font-semibold">{player.name}</p>
                          <div className="flex items-center gap-2 text-yellow-400"><Star className="w-3 h-3" /><span className="text-sm">{player.totalPoints} pts</span></div>
                        </div>
                      </div>
                      {user?.role !== 'admin' && player.id !== user?.id && (
                        <Button size="sm" variant="ghost" onClick={() => {
                          const u = rankings.find(r => r.id === player.id)
                          if (u) { setReportingUser({ id: u.id, name: u.name, email: '', totalPoints: u.totalPoints }); setShowReportModal(true) }
                        }} className="text-white/50"><Flag className="w-4 h-4" /></Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => (
                <Card key={team.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{team.logo}</span>
                      <div><p className="text-white font-bold">{team.shortName}</p><p className="text-white/50 text-xs">{team.city}</p></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-white/70">Record</span><span className="text-white font-semibold">{team.wins}W - {team.losses}L</span></div>
                      <Progress value={parseFloat(getTeamWinPercentage(team))} className="h-2 bg-white/10" />
                      <Badge variant="outline" className="border-white/20 text-white/70 text-xs">{team.division}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-black/30 border-t border-white/10 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-white/50 text-sm">
          <p>MLB Fantasy 2026 - Predice partidos de béisbol y compite con amigos</p>
        </div>
      </footer>

      {/* Report Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="bg-gray-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2"><Flag className="w-5 h-5 text-yellow-400" />Reportar Usuario</DialogTitle>
            <DialogDescription className="text-gray-400">Reportando a: <span className="font-semibold text-white">{reportingUser?.name}</span></DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Motivo</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue placeholder="Selecciona un motivo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cheating">🎮 Trampa / Hacking</SelectItem>
                  <SelectItem value="spam">📢 Spam</SelectItem>
                  <SelectItem value="harassment">🚫 Acoso</SelectItem>
                  <SelectItem value="other">📋 Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Descripción (opcional)</Label>
              <Textarea value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} placeholder="Describe el problema..." className="bg-white/10 border-white/20 text-white" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleReport} className="flex-1 bg-yellow-600 hover:bg-yellow-700">Enviar Reporte</Button>
              <Button variant="outline" onClick={() => setShowReportModal(false)} className="border-white/20 text-white">Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Name Modal */}
      {showNameInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-gray-900 border-white/20 w-full max-w-md mx-4">
            <CardHeader><CardTitle className="text-white">Tu Nombre</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Tu nombre..." className="bg-white/10 border-white/20 text-white" />
              <div className="flex gap-2">
                <Button onClick={updateUserName} className="flex-1 bg-green-600 hover:bg-green-700">Guardar</Button>
                <Button variant="outline" onClick={() => setShowNameInput(false)} className="border-white/20 text-white">Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
