import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // Aquí podrías validar contra el state guardado

  if (!code) return NextResponse.redirect(new URL('/configuracion?error=no_code', request.url));

  try {
    // 1. Intercambiar CODE por ACCESS_TOKEN
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY,
        client_secret: process.env.TIKTOK_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: "https://tu-dominio.com/api/auth/callback/tiktok",
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const openId = tokenData.open_id;

    // 2. Obtener Info del Usuario (Display Name / Avatar)
    const userResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=display_name,avatar_url', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const userData = await userResponse.json();
    const tiktokUser = userData.data.user.display_name;

    // 3. Guardar en Firestore (Asumiendo que tienes una forma de saber el UID del usuario)
    // Nota: El 'state' puede usarse para pasar el UID del usuario de Firebase
    // await updateDoc(doc(db, "users", userId), { 
    //   tiktokUser: tiktokUser,
    //   tiktokAccessToken: accessToken 
    // });

    return NextResponse.redirect(new URL('/configuracion?status=success', request.url));

  } catch (error) {
    console.error("Error en el callback de TikTok:", error);
    return NextResponse.redirect(new URL('/configuracion?status=error', request.url));
  }
}