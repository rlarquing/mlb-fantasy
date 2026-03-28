'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { 
  CircleDot, Trophy, Users, Calendar, Zap, Crown, Star, CheckCircle2,
  Shield, Activity, Ban, UserCheck, Plus, Clock, CreditCard, Wallet,
  ArrowUpRight, ArrowDownRight, TrendingUp, LogOut, LogIn, Settings,
  UsersRound, BarChart3, Target, DollarSign, Send, AlertCircle, Loader2
} from 'lucide-react'

// Interfaces
interface Player {
  id: string
  name: string
  position: string
  team?: { name: string; shortName: string; city: string }
  price: number
  marketValue: number
  isStar: boolean
  isFree: boolean
  hr: number
  rbi: number
  avg: number | null
  era: number | null
  wins: number
  saves: number
  totalFantasyPoints: number
}

interface Signing {
  id: string
  playerId: string
  price: number
  player: Player
}

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  paymentStatus: string
  balance: number
  totalPoints: number
  image?: string
}

interface Payment {
  id: string
  amount: number
  method: string
  reference?: string
  phoneNumber?: string
  status: string
  month: string
  verifiedAt?: string
  createdAt: string
  user?: { name: string; email: string }
}

interface League {
  id: string
  name: string
  budget: number
  maxPlayers: number
  lineupSize: number
  marketOpen: boolean
  monthlyFee: number
  season: string
  pointRules?: { action: string; points: number; description?: string }[]
}

interface Standing {
  id: string
  rank: number
  totalPoints: number
  user: { id: string; name: string; email: string; totalPoints: number; balance: number }
}

interface LineupEntry {
  id: string
  playerId: string
  position: string
  isStarter: boolean
  points: number
  player: Player
}

export default function MLBFantasyApp() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Data states
  const [league, setLeague] = useState<League | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [signings, setSignings] = useState<Signing[]>([])
  const [standings, setStandings] = useState<Standing[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([])
  const [lineupEntries, setLineupEntries] = useState<LineupEntry[]>([])
  const [currentWeek, setCurrentWeek] = useState(1)
  
  // UI states
  const [activeTab, setActiveTab] = useState('mercado')
  const [showAdmin, setShowAdmin] = useState(false)
  const [adminTab, setAdminTab] = useState('league')
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState('all')
  
  // Form states
  const [loginEmail, setLoginEmail] = useState('')
  const [loginName, setLoginName] = useState('')
  const [paymentForm, setPaymentForm] = useState({
    amount: 500,
    reference: '',
    phoneNumber: ''
  })
  
  // Admin form states
  const [leagueForm, setLeagueForm] = useState({
    budget: 100000000,
    maxPlayers: 25,
    lineupSize: 9,
    monthlyFee: 500,
    marketOpen: true
  })

  // Cargar datos del usuario
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchUserData()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status, session])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      // Obtener datos del usuario
      const userRes = await fetch('/api/auth/me')
      if (userRes.ok) {
        const userData = await userRes.json()
        setUser(userData)
      }
      
      // Obtener liga
      const leagueRes = await fetch('/api/league')
      if (leagueRes.ok) {
        const leagueData = await leagueRes.json()
        setLeague(leagueData.league)
        setStandings(leagueData.standings || [])
        setCurrentWeek(leagueData.stats?.currentWeek || 1)
      }
      
      // Cargar datos según el tab
      await Promise.all([
        fetchMarketData(),
        fetchPaymentsData()
      ])
      
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast({ title: 'Error', description: 'No se pudieron cargar los datos', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const fetchMarketData = async () => {
    try {
      const res = await fetch(`/api/market?userId=${user?.id || session?.user?.id}`)
      if (res.ok) {
        const data = await res.json()
        setPlayers(data.players || [])
        if (data.userData) {
          setSignings(data.userData.signings || [])
        }
      }
    } catch (error) {
      console.error('Error fetching market:', error)
    }
  }

  const fetchPaymentsData = async () => {
    try {
      const [userPayments, adminPayments] = await Promise.all([
        fetch(`/api/payments?userId=${user?.id || session?.user?.id}`),
        user?.role === 'admin' || session?.user?.role === 'admin' 
          ? fetch('/api/payments?adminView=true&status=pending')
          : null
      ])
      
      if (userPayments.ok) {
        setPayments(await userPayments.json())
      }
      if (adminPayments?.ok) {
        setPendingPayments(await adminPayments.json())
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    }
  }

  const fetchLineupData = async () => {
    try {
      const res = await fetch(`/api/lineup?userId=${user?.id || session?.user?.id}`)
      if (res.ok) {
        const data = await res.json()
        setLineupEntries(data.lineup?.entries || [])
        setSignings(data.signings || [])
      }
    } catch (error) {
      console.error('Error fetching lineup:', error)
    }
  }

  // Login handlers
  const handleDevLogin = async () => {
    if (!loginEmail) {
      toast({ title: 'Error', description: 'Ingresa tu email', variant: 'destructive' })
      return
    }
    
    const result = await signIn('dev-login', {
      email: loginEmail,
      name: loginName || loginEmail.split('@')[0],
      redirect: false
    })
    
    if (result?.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      setShowLoginDialog(false)
      toast({ title: '¡Bienvenido!', description: 'Has iniciado sesión correctamente' })
    }
  }

  const handleGoogleLogin = async () => {
    await signIn('google', { callbackUrl: '/' })
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  // Market handlers
  const handleBuyPlayer = async (playerId: string, price: number) => {
    try {
      if (!user && !session?.user) return
      
      const res = await fetch('/api/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, price })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
        return
      }
      
      toast({ title: '¡Fichaje exitoso!', description: data.message })
      await fetchMarketData()
      await fetchUserData()
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo completar el fichaje', variant: 'destructive' })
    }
  }

  const handleSellPlayer = async (playerId: string) => {
    try {
      const res = await fetch(`/api/market?playerId=${playerId}`, {
        method: 'DELETE'
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
        return
      }
      
      toast({ title: 'Venta exitosa', description: `Recibiste ${data.sellPrice?.toLocaleString()} pesos` })
      await fetchMarketData()
      await fetchUserData()
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo vender el jugador', variant: 'destructive' })
    }
  }

  // Payment handlers
  const handleCreatePayment = async () => {
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm)
      })
      
      if (!res.ok) {
        const data = await res.json()
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
        return
      }
      
      toast({ title: 'Pago registrado', description: 'Tu pago está pendiente de verificación' })
      setShowPaymentDialog(false)
      setPaymentForm({ amount: 500, reference: '', phoneNumber: '' })
      await fetchPaymentsData()
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo registrar el pago', variant: 'destructive' })
    }
  }

  const handleVerifyPayment = async (paymentId: string, action: 'verify' | 'reject') => {
    try {
      const res = await fetch('/api/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, action })
      })
      
      if (!res.ok) {
        toast({ title: 'Error', variant: 'destructive' })
        return
      }
      
      toast({ title: 'Pago actualizado' })
      await fetchPaymentsData()
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  // Admin handlers
  const handleUpdateLeague = async () => {
    try {
      if (!league) return
      
      const res = await fetch('/api/admin/league', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId: league.id, ...leagueForm })
      })
      
      if (!res.ok) {
        toast({ title: 'Error', variant: 'destructive' })
        return
      }
      
      const data = await res.json()
      setLeague(data)
      toast({ title: 'Liga actualizada' })
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const handleToggleMarket = async (marketOpen: boolean) => {
    try {
      const res = await fetch('/api/admin/market', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketOpen })
      })
      
      if (!res.ok) {
        toast({ title: 'Error', variant: 'destructive' })
        return
      }
      
      if (league) {
        setLeague({ ...league, marketOpen })
      }
      toast({ title: marketOpen ? 'Mercado abierto' : 'Mercado cerrado' })
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const handleExpelUsers = async () => {
    try {
      const res = await fetch('/api/payments', { method: 'DELETE' })
      const data = await res.json()
      toast({ title: 'Usuarios expulsados', description: data.message })
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  // Lineup handlers
  const handleSaveLineup = async (entries: { playerId: string; position: string; isStarter: boolean }[]) => {
    try {
      const res = await fetch('/api/lineup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries, week: currentWeek })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
        return
      }
      
      toast({ title: 'Lineup guardado' })
      await fetchLineupData()
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  // Filter players
  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.team?.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPosition = positionFilter === 'all' || p.position === positionFilter
    return matchesSearch && matchesPosition
  })

  // Format helpers
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-ES')

  // Loading screen
  if (status === 'loading' || (loading && session)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center">
        <div className="text-center text-white">
          <CircleDot className="w-16 h-16 mx-auto mb-4 animate-spin" />
          <p className="text-xl">Cargando MLB Fantasy...</p>
        </div>
      </div>
    )
  }

  // Login screen
  if (!session || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <div className="mx-auto bg-white/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <CircleDot className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl text-white">MLB Fantasy</CardTitle>
            <CardDescription className="text-green-200">
              Crea tu equipo, ficha jugadores y compite por la gloria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleGoogleLogin}
              className="w-full bg-white text-gray-800 hover:bg-gray-100 h-12"
              disabled={process.env.NODE_ENV === 'development'}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-green-800/50 px-2 text-green-200">o modo desarrollo</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="correo@ejemplo.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Input
                type="text"
                placeholder="Tu nombre"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button 
                onClick={handleDevLogin}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Entrar (Dev)
              </Button>
            </div>
            
            <p className="text-xs text-center text-white/50 mt-4">
              Al entrar, aceptas nuestros términos de servicio
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main app
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg">
                <CircleDot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">MLB Fantasy</h1>
                <p className="text-green-200 text-xs">Temporada {league?.season || new Date().getFullYear()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Admin button */}
              {(user?.role === 'admin' || session?.user?.role === 'admin') && (
                <Button 
                  onClick={() => setShowAdmin(!showAdmin)} 
                  variant={showAdmin ? 'default' : 'outline'}
                  className={showAdmin ? 'bg-red-600 hover:bg-red-700' : 'border-red-500/50 text-red-300 hover:bg-red-500/20'}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}
              
              {/* User info */}
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-sm">{user?.name || session?.user?.name}</p>
                  {(user?.role === 'admin' || session?.user?.role === 'admin') && (
                    <Badge className="bg-red-500 text-xs">ADMIN</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-yellow-400 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {user?.totalPoints?.toLocaleString() || 0} pts
                  </span>
                  <span className="text-green-300 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {((user?.balance || 0) / 1000000).toFixed(0)}M
                  </span>
                </div>
              </div>
              
              {/* Payment status */}
              {user?.paymentStatus === 'unpaid' && (
                <Badge className="bg-yellow-500 text-black animate-pulse">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Sin pagar
                </Badge>
              )}
              
              {/* Logout */}
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white/70 hover:text-white">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Payment Warning Banner */}
      {user?.paymentStatus === 'unpaid' && user?.role !== 'admin' && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-3 text-center">
          <p className="text-yellow-200 text-sm">
            <AlertCircle className="w-4 h-4 inline mr-2" />
            Debes pagar la mensualidad de {league?.monthlyFee || 500} pesos para participar.
            <Button 
              variant="link" 
              className="text-yellow-300 underline p-0 ml-2"
              onClick={() => setActiveTab('pagos')}
            >
              Pagar ahora
            </Button>
          </p>
        </div>
      )}

      {/* Admin Panel */}
      {showAdmin && (user?.role === 'admin' || session?.user?.role === 'admin') && (
        <div className="bg-red-900/20 border-b border-red-500/20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Tabs value={adminTab} onValueChange={setAdminTab}>
              <TabsList className="bg-black/30 border border-white/10 mb-4">
                <TabsTrigger value="league" className="data-[state=active]:bg-red-500/30 text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  Liga
                </TabsTrigger>
                <TabsTrigger value="market" className="data-[state=active]:bg-red-500/30 text-white">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Mercado
                </TabsTrigger>
                <TabsTrigger value="payments" className="data-[state=active]:bg-red-500/30 text-white">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pagos ({pendingPayments.length})
                </TabsTrigger>
                <TabsTrigger value="users" className="data-[state=active]:bg-red-500/30 text-white">
                  <Users className="w-4 h-4 mr-2" />
                  Usuarios
                </TabsTrigger>
              </TabsList>

              <TabsContent value="league">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Configuración de Liga</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-white/70">Presupuesto inicial</Label>
                      <Input
                        type="number"
                        value={leagueForm.budget}
                        onChange={(e) => setLeagueForm({...leagueForm, budget: parseInt(e.target.value)})}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white/70">Máximo de jugadores</Label>
                      <Input
                        type="number"
                        value={leagueForm.maxPlayers}
                        onChange={(e) => setLeagueForm({...leagueForm, maxPlayers: parseInt(e.target.value)})}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white/70">Jugadores en lineup</Label>
                      <Input
                        type="number"
                        value={leagueForm.lineupSize}
                        onChange={(e) => setLeagueForm({...leagueForm, lineupSize: parseInt(e.target.value)})}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white/70">Mensualidad (pesos)</Label>
                      <Input
                        type="number"
                        value={leagueForm.monthlyFee}
                        onChange={(e) => setLeagueForm({...leagueForm, monthlyFee: parseInt(e.target.value)})}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <Button onClick={handleUpdateLeague} className="md:col-span-2 bg-green-600 hover:bg-green-700">
                      Guardar cambios
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="market">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      Control del Mercado
                      <Badge className={league?.marketOpen ? 'bg-green-500' : 'bg-red-500'}>
                        {league?.marketOpen ? 'ABIERTO' : 'CERRADO'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white">Estado del mercado</span>
                      <Switch
                        checked={league?.marketOpen || false}
                        onCheckedChange={handleToggleMarket}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleToggleMarket(true)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        Abrir Mercado
                      </Button>
                      <Button 
                        onClick={() => handleToggleMarket(false)}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        Cerrar Mercado
                      </Button>
                    </div>
                    <Separator className="bg-white/10" />
                    <Button 
                      onClick={handleExpelUsers}
                      variant="destructive"
                      className="w-full"
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Expulsar usuarios sin pago
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payments">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Pagos Pendientes de Verificación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      {pendingPayments.length === 0 ? (
                        <p className="text-white/50 text-center py-8">No hay pagos pendientes</p>
                      ) : (
                        <div className="space-y-3">
                          {pendingPayments.map((payment) => (
                            <Card key={payment.id} className="bg-white/5 border-white/10">
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-white font-semibold">{payment.user?.name}</p>
                                    <p className="text-white/50 text-sm">{payment.user?.email}</p>
                                    <div className="flex gap-4 mt-1 text-sm">
                                      <span className="text-green-300">${payment.amount}</span>
                                      <span className="text-white/50">Ref: {payment.reference || 'N/A'}</span>
                                      <span className="text-white/50">Tel: {payment.phoneNumber || 'N/A'}</span>
                                    </div>
                                    <p className="text-white/30 text-xs mt-1">
                                      {formatDate(payment.createdAt)}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleVerifyPayment(payment.id, 'verify')}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleVerifyPayment(payment.id, 'reject')}
                                    >
                                      <Ban className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Gestión de Usuarios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-2">
                        {standings.map((s) => (
                          <div key={s.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-white font-bold w-6">{s.rank}</span>
                              <div>
                                <p className="text-white">{s.user.name}</p>
                                <p className="text-white/50 text-xs">{s.user.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-400 text-sm">{s.user.totalPoints} pts</span>
                              <span className="text-green-300 text-sm">{(s.user.balance / 1000000).toFixed(0)}M</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-black/30 border border-white/10 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="mercado" className="data-[state=active]:bg-green-600 text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Mercado
            </TabsTrigger>
            <TabsTrigger value="equipo" className="data-[state=active]:bg-green-600 text-white">
              <Users className="w-4 h-4 mr-2" />
              Mi Equipo
            </TabsTrigger>
            <TabsTrigger value="lineup" className="data-[state=active]:bg-green-600 text-white">
              <Target className="w-4 h-4 mr-2" />
              Lineup
            </TabsTrigger>
            <TabsTrigger value="clasificacion" className="data-[state=active]:bg-green-600 text-white">
              <Trophy className="w-4 h-4 mr-2" />
              Clasificación
            </TabsTrigger>
            <TabsTrigger value="pagos" className="data-[state=active]:bg-green-600 text-white">
              <CreditCard className="w-4 h-4 mr-2" />
              Pagos
            </TabsTrigger>
          </TabsList>

          {/* Mercado Tab */}
          <TabsContent value="mercado">
            <div className="space-y-4">
              {/* Filters */}
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-3">
                    <Input
                      placeholder="Buscar jugador o equipo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 min-w-48 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                    <Select value={positionFilter} onValueChange={setPositionFilter}>
                      <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Posición" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="P">Pitcher</SelectItem>
                        <SelectItem value="C">Catcher</SelectItem>
                        <SelectItem value="1B">1B</SelectItem>
                        <SelectItem value="2B">2B</SelectItem>
                        <SelectItem value="3B">3B</SelectItem>
                        <SelectItem value="SS">SS</SelectItem>
                        <SelectItem value="OF">OF</SelectItem>
                        <SelectItem value="DH">DH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span className="text-white/70">Balance: <span className="text-green-300 font-bold">{formatCurrency(user?.balance || 0)}</span></span>
                    <span className="text-white/70">Jugadores: <span className="text-white font-bold">{signings.length}/{league?.maxPlayers || 25}</span></span>
                    <Badge className={league?.marketOpen ? 'bg-green-500' : 'bg-red-500'}>
                      {league?.marketOpen ? 'Mercado Abierto' : 'Mercado Cerrado'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Players Grid */}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {filteredPlayers.slice(0, 50).map((player) => (
                  <Card key={player.id} className={`bg-white/5 border-white/10 ${player.isStar ? 'border-yellow-500/50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-semibold">{player.name}</p>
                            {player.isStar && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                          </div>
                          <p className="text-white/50 text-sm">{player.team?.name} - {player.position}</p>
                        </div>
                        <Badge variant="outline" className="border-white/20 text-white">
                          {player.position}
                        </Badge>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-center">
                        {player.position !== 'P' ? (
                          <>
                            <div className="bg-white/5 rounded p-1">
                              <p className="text-white/50">HR</p>
                              <p className="text-white font-bold">{player.hr}</p>
                            </div>
                            <div className="bg-white/5 rounded p-1">
                              <p className="text-white/50">RBI</p>
                              <p className="text-white font-bold">{player.rbi}</p>
                            </div>
                            <div className="bg-white/5 rounded p-1">
                              <p className="text-white/50">AVG</p>
                              <p className="text-white font-bold">{player.avg?.toFixed(3) || '.000'}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="bg-white/5 rounded p-1">
                              <p className="text-white/50">W</p>
                              <p className="text-white font-bold">{player.wins}</p>
                            </div>
                            <div className="bg-white/5 rounded p-1">
                              <p className="text-white/50">SV</p>
                              <p className="text-white font-bold">{player.saves}</p>
                            </div>
                            <div className="bg-white/5 rounded p-1">
                              <p className="text-white/50">ERA</p>
                              <p className="text-white font-bold">{player.era?.toFixed(2) || '0.00'}</p>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-green-300 font-bold">{formatCurrency(player.price)}</p>
                        {player.isFree ? (
                          <Button
                            size="sm"
                            onClick={() => handleBuyPlayer(player.id, player.price)}
                            disabled={!league?.marketOpen || (user?.balance || 0) < player.price || signings.length >= (league?.maxPlayers || 25)}
                            className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Fichar
                          </Button>
                        ) : (
                          <Badge className="bg-gray-500">No disponible</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Mi Equipo Tab */}
          <TabsContent value="equipo">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Mi Plantilla</CardTitle>
                  <div className="text-right">
                    <p className="text-white/70 text-sm">Balance</p>
                    <p className="text-green-300 font-bold text-xl">{formatCurrency(user?.balance || 0)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {signings.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-white/30" />
                    <p className="text-white/50">No tienes jugadores en tu plantilla</p>
                    <Button onClick={() => setActiveTab('mercado')} className="mt-4 bg-green-600 hover:bg-green-700">
                      Ir al Mercado
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {signings.map((signing) => (
                        <div key={signing.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="text-white font-semibold">{signing.player.name}</p>
                              <p className="text-white/50 text-sm">{signing.player.team?.name} - {signing.player.position}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-green-300">{formatCurrency(signing.player.marketValue)}</p>
                              <p className="text-white/50 text-xs">Precio compra: {formatCurrency(signing.price)}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleSellPlayer(signing.playerId)}
                              disabled={!league?.marketOpen}
                            >
                              <ArrowDownRight className="w-4 h-4 mr-1" />
                              Vender
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lineup Tab */}
          <TabsContent value="lineup">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Lineup Semanal</CardTitle>
                    <CardDescription className="text-white/50">
                      Semana {currentWeek} - Selecciona {league?.lineupSize || 9} titulares
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-500">
                    {lineupEntries.filter(e => e.isStarter).length}/{league?.lineupSize || 9} titulares
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {signings.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 mx-auto mb-4 text-white/30" />
                    <p className="text-white/50">Necesitas jugadores para crear tu lineup</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-white/70 mb-2">
                      <p>Posiciones: P (Pitcher), C (Catcher), 1B, 2B, 3B, SS (Shortstop), OF (Outfield), DH (Designated Hitter)</p>
                    </div>
                    <ScrollArea className="h-96">
                      <div className="space-y-2">
                        {signings.map((signing) => {
                          const entry = lineupEntries.find(e => e.playerId === signing.playerId)
                          const isStarter = entry?.isStarter ?? false
                          
                          return (
                            <div key={signing.id} className={`flex items-center justify-between p-3 rounded-lg ${isStarter ? 'bg-green-600/20 border border-green-500/30' : 'bg-white/5'}`}>
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="border-white/20 text-white">
                                  {signing.player.position}
                                </Badge>
                                <div>
                                  <p className="text-white font-semibold">{signing.player.name}</p>
                                  <p className="text-white/50 text-sm">{signing.player.team?.name}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-yellow-400 text-sm">{signing.player.totalFantasyPoints} pts</span>
                                <Switch
                                  checked={isStarter}
                                  onCheckedChange={(checked) => {
                                    const entries = signings.map(s => ({
                                      playerId: s.playerId,
                                      position: s.player.position,
                                      isStarter: s.playerId === signing.playerId ? checked : lineupEntries.find(e => e.playerId === s.playerId)?.isStarter ?? false
                                    }))
                                    handleSaveLineup(entries)
                                  }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clasificación Tab */}
          <TabsContent value="clasificacion">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Clasificación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {standings.map((s, index) => (
                      <div 
                        key={s.id} 
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          s.user.id === user?.id ? 'bg-green-600/20 border border-green-500/30' : 'bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-300 text-black' :
                            index === 2 ? 'bg-amber-600 text-black' :
                            'bg-white/10 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{s.user.name}</p>
                            <p className="text-white/50 text-xs">{s.user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-400 font-bold">{s.user.totalPoints.toLocaleString()} pts</p>
                          <p className="text-green-300 text-sm">{formatCurrency(s.user.balance)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pagos Tab */}
          <TabsContent value="pagos">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Payment Info */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Información de Pago</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-300 font-semibold mb-2">Transfermóvil</p>
                    <div className="space-y-2 text-sm">
                      <p className="text-white"><span className="text-white/50">Número:</span> +53 5XXX-XXXX</p>
                      <p className="text-white"><span className="text-white/50">Concepto:</span> MLB Fantasy - {user?.email}</p>
                      <p className="text-white"><span className="text-white/50">Monto:</span> {formatCurrency(league?.monthlyFee || 500)} CUP</p>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-300 text-sm">
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      Importante: Guarda el número de referencia del pago
                    </p>
                  </div>
                  
                  <Button onClick={() => setShowPaymentDialog(true)} className="w-full bg-green-600 hover:bg-green-700">
                    <Send className="w-4 h-4 mr-2" />
                    Registrar Pago
                  </Button>
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Historial de Pagos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    {payments.length === 0 ? (
                      <p className="text-white/50 text-center py-8">No hay pagos registrados</p>
                    ) : (
                      <div className="space-y-2">
                        {payments.map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div>
                              <p className="text-white">{payment.month}</p>
                              <p className="text-white/50 text-sm">{formatDate(payment.createdAt)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-green-300 font-bold">{formatCurrency(payment.amount)}</p>
                              <Badge className={
                                payment.status === 'verified' ? 'bg-green-500' :
                                payment.status === 'rejected' ? 'bg-red-500' :
                                'bg-yellow-500'
                              }>
                                {payment.status === 'verified' ? 'Verificado' :
                                 payment.status === 'rejected' ? 'Rechazado' :
                                 'Pendiente'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="bg-gray-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Registrar Pago</DialogTitle>
            <DialogDescription className="text-white/50">
              Ingresa los datos de tu transferencia por Transfermóvil
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white/70">Monto</Label>
              <Input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({...paymentForm, amount: parseInt(e.target.value)})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label className="text-white/70">Número de Referencia</Label>
              <Input
                value={paymentForm.reference}
                onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
                placeholder="Ej: 1234567890"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label className="text-white/70">Número de Teléfono</Label>
              <Input
                value={paymentForm.phoneNumber}
                onChange={(e) => setPaymentForm({...paymentForm, phoneNumber: e.target.value})}
                placeholder="Ej: 5XXXXXXX"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)} className="border-white/20 text-white">
              Cancelar
            </Button>
            <Button onClick={handleCreatePayment} className="bg-green-600 hover:bg-green-700">
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
