'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { 
  CircleDot, Trophy, Users, Calendar, Zap, Crown, Star, CheckCircle2,
  Shield, Ban, Plus, CreditCard, Wallet,
  TrendingUp, LogOut, LogIn, Settings,
  Target, DollarSign, AlertCircle, Loader2, Crown as CaptainIcon
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
  number?: number
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
}

interface Standing {
  id: string
  rank: number
  totalPoints: number
  name: string
  email: string
  balance: number
}

interface LineupEntry {
  id: string
  playerId: string
  position: string
  isStarter: boolean
  isCaptain: boolean
  points: number
  player: Player
}

// Información de Transfermóvil
const TRANSFERMOVIL_INFO = {
  accountNumber: '9223 4567 8901 2345',
  accountHolder: 'MLB Fantasy Cuba',
  concept: 'Mensualidad MLB Fantasy'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState('all')
  const [teamFilter, setTeamFilter] = useState('all')
  
  // Form states
  const [paymentForm, setPaymentForm] = useState({
    amount: 500,
    reference: '',
    phoneNumber: ''
  })
  
  // Admin form states
  const [leagueForm, setLeagueForm] = useState({
    budget: 100000000,
    maxPlayers: 25,
    lineupSize: 11,
    monthlyFee: 500,
    marketOpen: true
  })

  // Lineup state
  const [selectedLineup, setSelectedLineup] = useState<{playerId: string; position: string; isCaptain: boolean}[]>([])
  const [captainId, setCaptainId] = useState<string | null>(null)

  // Cargar datos del usuario
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchUserData()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status, session])

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true)
      
      const userRes = await fetch('/api/auth/me')
      if (userRes.ok) {
        const userData = await userRes.json()
        setUser(userData)
      }
      
      const leagueRes = await fetch('/api/league')
      if (leagueRes.ok) {
        const leagueData = await leagueRes.json()
        setLeague(leagueData.league)
        setStandings(leagueData.standings || [])
        setCurrentWeek(leagueData.stats?.currentWeek || 1)
      }
      
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
  }, [])

  const fetchMarketData = useCallback(async () => {
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
  }, [user?.id, session?.user?.id])

  const fetchPaymentsData = useCallback(async () => {
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
  }, [user?.id, user?.role, session?.user?.id, session?.user?.role])

  const fetchLineupData = useCallback(async () => {
    try {
      const res = await fetch(`/api/lineup?userId=${user?.id || session?.user?.id}`)
      if (res.ok) {
        const data = await res.json()
        setLineupEntries(data.lineup?.entries || [])
        setSignings(data.signings || [])
        
        // Load existing lineup selection
        if (data.lineup?.entries) {
          const entries = data.lineup.entries
            .filter((e: LineupEntry) => e.isStarter)
            .map((e: LineupEntry) => ({
              playerId: e.playerId,
              position: e.position,
              isCaptain: e.isCaptain
            }))
          setSelectedLineup(entries)
          const captain = entries.find((e: { isCaptain: boolean }) => e.isCaptain)
          if (captain) setCaptainId(captain.playerId)
        }
      }
    } catch (error) {
      console.error('Error fetching lineup:', error)
    }
  }, [user?.id, session?.user?.id])

  // Login handlers
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
    } catch {
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
    } catch {
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
    } catch {
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
      
      toast({ title: action === 'verify' ? 'Pago confirmado' : 'Pago rechazado' })
      await fetchPaymentsData()
    } catch {
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
    } catch {
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
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const handleExpelUsers = async () => {
    try {
      const res = await fetch('/api/payments', { method: 'DELETE' })
      const data = await res.json()
      toast({ title: 'Usuarios expulsados', description: `${data.count || 0} usuarios expulsados` })
      await fetchPaymentsData()
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  // Lineup handlers
  const handleAddToLineup = (playerId: string, position: string) => {
    // Verificar que el jugador no esté ya en el lineup
    if (selectedLineup.some(e => e.playerId === playerId)) {
      toast({ title: 'Error', description: 'El jugador ya está en el lineup', variant: 'destructive' })
      return
    }
    
    // Verificar que la posición no esté ocupada
    if (selectedLineup.some(e => e.position === position)) {
      toast({ title: 'Error', description: 'Esa posición ya está ocupada', variant: 'destructive' })
      return
    }
    
    setSelectedLineup([...selectedLineup, { playerId, position, isCaptain: false }])
  }

  const handleRemoveFromLineup = (playerId: string) => {
    setSelectedLineup(selectedLineup.filter(e => e.playerId !== playerId))
    if (captainId === playerId) setCaptainId(null)
  }

  const handleSetCaptain = (playerId: string) => {
    setSelectedLineup(selectedLineup.map(e => ({
      ...e,
      isCaptain: e.playerId === playerId
    })))
    setCaptainId(playerId)
  }

  const handleSaveLineup = async () => {
    try {
      // Validar lineup completo
      const requiredPositions = ['P', 'C', '1B', '2B', '3B', 'SS', 'OF', 'OF', 'OF', 'DH']
      const positionsFilled = requiredPositions.every(pos => {
        if (pos === 'OF') {
          return selectedLineup.filter(e => e.position === 'OF').length === 3
        }
        return selectedLineup.some(e => e.position === pos)
      })
      
      if (!positionsFilled) {
        toast({ title: 'Error', description: 'Debes completar todas las posiciones', variant: 'destructive' })
        return
      }
      
      if (!captainId) {
        toast({ title: 'Error', description: 'Debes seleccionar un capitán', variant: 'destructive' })
        return
      }
      
      const res = await fetch('/api/lineup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          entries: selectedLineup.map(e => ({
            playerId: e.playerId,
            position: e.position,
            isStarter: true,
            isCaptain: e.isCaptain
          })),
          week: currentWeek
        })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
        return
      }
      
      toast({ title: 'Lineup guardado', description: 'Tu lineup ha sido configurado correctamente' })
      await fetchLineupData()
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  // Filter players
  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.team?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.team?.shortName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPosition = positionFilter === 'all' || p.position === positionFilter
    const matchesTeam = teamFilter === 'all' || p.team?.shortName === teamFilter
    return matchesSearch && matchesPosition && matchesTeam
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
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </Button>
            
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
                <p className="text-green-200 text-xs">Temporada {league?.season || new Date().getFullYear()} - Semana {currentWeek}</p>
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
              <div className="text-right hidden sm:block">
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
              {user?.paymentStatus === 'unpaid' && user?.role !== 'admin' && (
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
              <TabsList className="bg-black/30 border border-white/10 mb-4 flex-wrap h-auto">
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
                      Expulsar usuarios sin pago (30+ días)
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
                    <CardTitle className="text-white">Clasificación de la Liga</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-2">
                        {standings.map((s) => (
                          <div key={s.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-white font-bold w-6">#{s.rank}</span>
                              <div>
                                <p className="text-white">{s.name}</p>
                                <p className="text-white/50 text-xs">{s.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-400 text-sm">{s.totalPoints} pts</span>
                              <span className="text-green-300 text-sm">{(s.balance / 1000000).toFixed(0)}M</span>
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
                  <div className="mt-3 flex items-center gap-4 text-sm flex-wrap">
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
                {filteredPlayers.slice(0, 60).map((player) => (
                  <Card key={player.id} className={`bg-white/5 border-white/10 ${player.isStar ? 'border-yellow-500/50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-semibold">{player.name}</p>
                            {player.isStar && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                          </div>
                          <p className="text-white/50 text-sm">{player.team?.name || 'Sin equipo'} - {player.position}</p>
                          {player.number && <p className="text-white/30 text-xs">#{player.number}</p>}
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
                          <Badge className="bg-gray-500">Fichado</Badge>
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
                  <CardTitle className="text-white">Mi Plantilla ({signings.length} jugadores)</CardTitle>
                  <div className="text-right">
                    <p className="text-white/70 text-sm">Balance disponible</p>
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
                  <ScrollArea className="max-h-[600px]">
                    <div className="grid gap-3 md:grid-cols-2">
                      {signings.map((signing) => (
                        <Card key={signing.id} className="bg-white/5 border-white/10">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-white font-semibold">{signing.player.name}</p>
                                  {signing.player.isStar && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                                </div>
                                <p className="text-white/50 text-sm">{signing.player.team?.name} - {signing.player.position}</p>
                                <p className="text-white/30 text-xs">Fichado por: {formatCurrency(signing.price)}</p>
                              </div>
                              <Badge variant="outline" className="border-white/20 text-white">
                                {signing.player.position}
                              </Badge>
                            </div>
                            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-center">
                              {signing.player.position !== 'P' ? (
                                <>
                                  <div className="bg-white/5 rounded p-1">
                                    <p className="text-white/50">HR</p>
                                    <p className="text-white font-bold">{signing.player.hr}</p>
                                  </div>
                                  <div className="bg-white/5 rounded p-1">
                                    <p className="text-white/50">RBI</p>
                                    <p className="text-white font-bold">{signing.player.rbi}</p>
                                  </div>
                                  <div className="bg-white/5 rounded p-1">
                                    <p className="text-white/50">AVG</p>
                                    <p className="text-white font-bold">{signing.player.avg?.toFixed(3) || '.000'}</p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="bg-white/5 rounded p-1">
                                    <p className="text-white/50">W</p>
                                    <p className="text-white font-bold">{signing.player.wins}</p>
                                  </div>
                                  <div className="bg-white/5 rounded p-1">
                                    <p className="text-white/50">SV</p>
                                    <p className="text-white font-bold">{signing.player.saves}</p>
                                  </div>
                                  <div className="bg-white/5 rounded p-1">
                                    <p className="text-white/50">ERA</p>
                                    <p className="text-white font-bold">{signing.player.era?.toFixed(2) || '0.00'}</p>
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <p className="text-green-300 text-sm">Valor: {formatCurrency(signing.player.marketValue)}</p>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleSellPlayer(signing.playerId)}
                                disabled={!league?.marketOpen}
                              >
                                Vender
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
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
                    <CardTitle className="text-white">Configurar Lineup - Semana {currentWeek}</CardTitle>
                    <CardDescription className="text-white/50">
                      Selecciona tu once ideal. El capitán obtiene el doble de puntos.
                    </CardDescription>
                  </div>
                  <Button onClick={() => fetchLineupData()} variant="outline" className="border-white/20 text-white">
                    Cargar Plantilla
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {signings.length < 11 ? (
                  <div className="text-center py-8">
                    <Target className="w-16 h-16 mx-auto mb-4 text-white/30" />
                    <p className="text-white/50">Necesitas al menos 11 jugadores para configurar tu lineup</p>
                    <p className="text-white/30 text-sm mt-2">Actualmente tienes {signings.length} jugadores</p>
                    <Button onClick={() => setActiveTab('mercado')} className="mt-4 bg-green-600 hover:bg-green-700">
                      Ir al Mercado
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Available Players */}
                    <div>
                      <h3 className="text-white font-semibold mb-3">Tus Jugadores</h3>
                      <ScrollArea className="h-96">
                        <div className="space-y-2">
                          {signings.map((s) => {
                            const inLineup = selectedLineup.some(e => e.playerId === s.playerId)
                            return (
                              <div 
                                key={s.id} 
                                className={`p-3 rounded-lg ${inLineup ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5'}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-white font-medium">{s.player.name}</p>
                                    <p className="text-white/50 text-xs">{s.player.team?.shortName} - {s.player.position}</p>
                                  </div>
                                  {!inLineup ? (
                                    <Select onValueChange={(pos) => handleAddToLineup(s.playerId, pos)}>
                                      <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white text-xs">
                                        <SelectValue placeholder="Agregar" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value={s.player.position}>{s.player.position}</SelectItem>
                                        {s.player.position !== 'P' && <SelectItem value="DH">DH</SelectItem>}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      {selectedLineup.find(e => e.playerId === s.playerId)?.isCaptain && (
                                        <Badge className="bg-yellow-500 text-black">
                                          <CaptainIcon className="w-3 h-3 mr-1" />
                                          CAP
                                        </Badge>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-400 hover:text-red-300"
                                        onClick={() => handleRemoveFromLineup(s.playerId)}
                                      >
                                        <Ban className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Lineup Selection */}
                    <div>
                      <h3 className="text-white font-semibold mb-3">Tu Lineup ({selectedLineup.length}/11)</h3>
                      <div className="space-y-2">
                        {['P', 'C', '1B', '2B', '3B', 'SS', 'OF', 'OF', 'OF', 'DH'].map((pos) => {
                          const entry = selectedLineup.find(e => e.position === pos)
                          const isOF = pos === 'OF'
                          const ofCount = selectedLineup.filter(e => e.position === 'OF').length
                          
                          if (isOF) {
                            const ofEntries = selectedLineup.filter(e => e.position === 'OF')
                            const ofIndex = ofEntries.findIndex(e => !entry || e.playerId !== entry.playerId)
                            
                            return (
                              <div key={`of-${ofIndex}`} className="p-3 rounded-lg bg-white/5">
                                <div className="flex items-center justify-between">
                                  <span className="text-white/70">OF ({ofCount}/3)</span>
                                  {ofEntries.length > 0 && ofEntries.map((ofEntry, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <span className="text-white">{signings.find(s => s.playerId === ofEntry.playerId)?.player.name}</span>
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant={ofEntry.isCaptain ? 'default' : 'outline'}
                                          className={ofEntry.isCaptain ? 'bg-yellow-500 text-black h-6 w-6 p-0' : 'border-yellow-500/50 text-yellow-300 h-6 w-6 p-0'}
                                          onClick={() => handleSetCaptain(ofEntry.playerId)}
                                        >
                                          <CaptainIcon className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                                          onClick={() => handleRemoveFromLineup(ofEntry.playerId)}
                                        >
                                          <Ban className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          }
                          
                          return (
                            <div key={pos} className={`p-3 rounded-lg ${entry ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5'}`}>
                              <div className="flex items-center justify-between">
                                <span className="text-white/70">{getPositionName(pos)}</span>
                                {entry ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-white">{signings.find(s => s.playerId === entry.playerId)?.player.name}</span>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant={entry.isCaptain ? 'default' : 'outline'}
                                        className={entry.isCaptain ? 'bg-yellow-500 text-black h-6 w-6 p-0' : 'border-yellow-500/50 text-yellow-300 h-6 w-6 p-0'}
                                        onClick={() => handleSetCaptain(entry.playerId)}
                                      >
                                        <CaptainIcon className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                                        onClick={() => handleRemoveFromLineup(entry.playerId)}
                                      >
                                        <Ban className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <Badge variant="outline" className="border-red-500/50 text-red-300">Vacío</Badge>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      
                      <Button 
                        onClick={handleSaveLineup}
                        className="w-full mt-4 bg-green-600 hover:bg-green-700"
                        disabled={selectedLineup.length !== 11 || !captainId}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Guardar Lineup
                      </Button>
                    </div>
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
                  Clasificación General
                </CardTitle>
                <CardDescription className="text-white/50">
                  Temporada {league?.season || new Date().getFullYear()} - Semana {currentWeek}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {standings.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-white/30" />
                    <p className="text-white/50">No hay clasificación disponible</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[500px]">
                    <div className="space-y-2">
                      {standings.map((s, index) => (
                        <div 
                          key={s.id} 
                          className={`flex items-center justify-between p-4 rounded-lg ${
                            index === 0 ? 'bg-yellow-500/20 border border-yellow-500/30' :
                            index === 1 ? 'bg-gray-400/20 border border-gray-400/30' :
                            index === 2 ? 'bg-amber-600/20 border border-amber-600/30' :
                            'bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span className={`text-2xl font-bold ${
                              index === 0 ? 'text-yellow-400' :
                              index === 1 ? 'text-gray-300' :
                              index === 2 ? 'text-amber-500' :
                              'text-white/50'
                            }`}>
                              #{s.rank}
                            </span>
                            <div>
                              <p className="text-white font-semibold">{s.name}</p>
                              <p className="text-white/50 text-xs">{s.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-yellow-400 font-bold text-lg">{s.totalPoints} pts</p>
                            <p className="text-green-300 text-sm">{formatCurrency(s.balance)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pagos Tab */}
          <TabsContent value="pagos">
            <div className="space-y-6">
              {/* Payment Instructions */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Instrucciones de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-200 font-semibold mb-2">Transfermóvil</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-white"><span className="text-white/50">Cuenta:</span> {TRANSFERMOVIL_INFO.accountNumber}</p>
                      <p className="text-white"><span className="text-white/50">Beneficiario:</span> {TRANSFERMOVIL_INFO.accountHolder}</p>
                      <p className="text-white"><span className="text-white/50">Concepto:</span> {TRANSFERMOVIL_INFO.concept}</p>
                      <p className="text-green-300 font-bold mt-2">Monto: ${league?.monthlyFee || 500} CUP</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setShowPaymentDialog(true)}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={user?.paymentStatus === 'paid'}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {user?.paymentStatus === 'paid' ? 'Pagado este mes' : 'Registrar Pago'}
                  </Button>
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Historial de Pagos</CardTitle>
                </CardHeader>
                <CardContent>
                  {payments.length === 0 ? (
                    <p className="text-white/50 text-center py-8">No tienes pagos registrados</p>
                  ) : (
                    <ScrollArea className="max-h-96">
                      <div className="space-y-2">
                        {payments.map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div>
                              <p className="text-white font-medium">${payment.amount} - {payment.month}</p>
                              <p className="text-white/50 text-sm">Ref: {payment.reference || 'N/A'}</p>
                              <p className="text-white/30 text-xs">{formatDate(payment.createdAt)}</p>
                            </div>
                            <Badge className={
                              payment.status === 'verified' ? 'bg-green-500' :
                              payment.status === 'pending' ? 'bg-yellow-500 text-black' :
                              'bg-red-500'
                            }>
                              {payment.status === 'verified' ? 'Verificado' :
                               payment.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="bg-green-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Registrar Pago</DialogTitle>
            <DialogDescription className="text-white/50">
              Ingresa los datos de tu transferencia por Transfermóvil
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white/70">Monto (pesos)</Label>
              <Input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({...paymentForm, amount: parseInt(e.target.value) || 500})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label className="text-white/70">Número de referencia</Label>
              <Input
                value={paymentForm.reference}
                onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
                placeholder="Ej: 123456789"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label className="text-white/70">Número de teléfono</Label>
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
              Registrar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper function
function getPositionName(code: string): string {
  const names: Record<string, string> = {
    'P': 'Pitcher',
    'C': 'Catcher',
    '1B': 'Primera Base',
    '2B': 'Segunda Base',
    '3B': 'Tercera Base',
    'SS': 'Shortstop',
    'OF': 'Outfielder',
    'DH': 'Bateador Designado'
  }
  return names[code] || code
}
