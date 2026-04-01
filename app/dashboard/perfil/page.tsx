'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, ArrowLeft, Camera, UserCircle } from 'lucide-react'
import Swal from 'sweetalert2'
import Link from 'next/link'

const API_URL = 'https://api-linkah.onrender.com'

interface FormDataState {
  nome: string
  cpf_cnpj: string
  cep: string
  rua: string
  numero: string
  bairro: string
  linkedin: string
  instagram: string
  bio: string
  foto_perfil?: string
}

function PerfilContent() {

  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [fotoFile, setFotoFile] = useState<File | null>(null)

  const [formData, setFormData] = useState<FormDataState>({
    nome: '',
    cpf_cnpj: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    linkedin: '',
    instagram: '',
    bio: ''
  })

  function getUsuario() {

    const user = localStorage.getItem('@Linkah:User')
    const parsed = user ? JSON.parse(user) : null

    const email =
      parsed?.email ||
      localStorage.getItem('userEmail') ||
      ''

    const token =
      localStorage
        .getItem('@Linkah:Token')
        ?.replace(/['"]+/g, '') || ''

    return { email, token }

  }

  // carregar perfil

  useEffect(() => {

    const carregarPerfil = async () => {

      const { email, token } = getUsuario()

      if (!email) {
        router.push('/site/login')
        return
      }

      try {

        const res = await fetch(
          `${API_URL}/api/auth/perfil?email=${encodeURIComponent(email)}`,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await res.json()

        setFormData({
          nome: data.nome || '',
          cpf_cnpj: data.cpf_cnpj || '',
          cep: data.cep || '',
          rua: data.rua || '',
          numero: data.numero || '',
          bairro: data.bairro || '',
          linkedin: data.linkedin || '',
          instagram: data.instagram || '',
          bio: data.bio || '',
          foto_perfil: data.foto_perfil || ''
        })

        if (data.foto_perfil) {
          setFotoPreview(data.foto_perfil)
        }

      } catch (error) {

        console.error('Erro carregar perfil', error)

      } finally {

        setIsLoading(false)

      }

    }

    carregarPerfil()

  }, [router])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {

    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

  }

  function handleFotoChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {

    const file = e.target.files?.[0]

    if (!file) return

    setFotoFile(file)

    const preview = URL.createObjectURL(file)
    setFotoPreview(preview)

  }

  async function handleSalvar(e: React.FormEvent) {

    e.preventDefault()

    setIsSaving(true)

    const { email, token } = getUsuario()

    try {

      const payload = new FormData()

      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value)
      })

      payload.append('email_original', email)

      if (fotoFile) {
        payload.append('foto_perfil', fotoFile)
      }

      const res = await fetch(`${API_URL}/api/auth/perfil`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: payload
      })

      if (!res.ok) {
        throw new Error('Erro salvar perfil')
      }

      Swal.fire({
        icon: 'success',
        title: 'Perfil atualizado'
      })

    } catch (error: any) {

      Swal.fire({
        icon: 'error',
        title: error.message
      })

    } finally {

      setIsSaving(false)

    }

  }

  if (isLoading) {

    return (

      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-red-500" />
      </div>

    )

  }

  return (

    <div className="min-h-screen bg-gray-50 p-10">

      <div className="max-w-xl mx-auto bg-white p-10 rounded-3xl shadow">

        <Link
          href="/dashboard/eventos"
          className="flex items-center gap-2 mb-6"
        >
          <ArrowLeft size={18} />
          Voltar
        </Link>

        <div className="flex items-center gap-6 mb-8">

          <label className="cursor-pointer relative">

            {fotoPreview ? (

              <img
                src={fotoPreview}
                className="w-24 h-24 rounded-2xl object-cover"
              />

            ) : (

              <div className="w-24 h-24 bg-black rounded-2xl flex items-center justify-center">
                <UserCircle size={40} color="white"/>
              </div>

            )}

            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFotoChange}
            />

            <div className="absolute bottom-0 right-0 bg-red-500 p-2 rounded-xl">
              <Camera size={16} color="white"/>
            </div>

          </label>

          <div>

            <h1 className="text-2xl font-bold">
              Meu Perfil
            </h1>

            <p className="text-gray-400">
              Edite suas informações
            </p>

          </div>

        </div>

        <form
          onSubmit={handleSalvar}
          className="space-y-4"
        >

          <input
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Nome"
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="cpf_cnpj"
            value={formData.cpf_cnpj}
            onChange={handleChange}
            placeholder="CPF ou CNPJ"
            className="w-full border p-3 rounded-xl"
          />

          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Bio"
            className="w-full border p-3 rounded-xl"
          />

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-red-500 text-white p-4 rounded-xl flex justify-center items-center gap-2"
          >

            {isSaving
              ? <Loader2 className="animate-spin"/>
              : <Save size={18}/>
            }

            Salvar Perfil

          </button>

        </form>

      </div>

    </div>

  )

}

export default function PerfilPage() {

  return (

    <Suspense fallback={<Loader2 className="animate-spin"/>}>
      <PerfilContent />
    </Suspense>

  )

}