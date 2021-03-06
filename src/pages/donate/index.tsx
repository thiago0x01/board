import { PayPalButtons } from '@paypal/react-paypal-js';
import { doc, setDoc } from 'firebase/firestore/lite';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import { db } from '../../services/firebaseConnection';
import styles from './styles.module.scss';

interface DonateProps {
  user: { name: string; id: string; image: string };
}

export default function Donate({ user }: DonateProps) {
  const [vip, setVip] = useState(false);

  async function handleSaveDonate() {
    await setDoc(doc(db, 'users', user.id), {
      donate: true,
      lastDonate: new Date(),
      image: user.image,
    }).then(() => {
      setVip(true);
    });
  }

  return (
    <>
      <Head>
        🏆
        <title>Ajude a plataforma board ficar online!</title>
      </Head>

      <main className={styles.container}>
        <Image
          src='/images/rocket.svg'
          alt='Foto de perfil do usuário'
          width={350}
          height={350}
        />

        {vip && (
          <div className={styles.vip}>
            <div>
              <Image src={user.image} alt='' width={50} height={50} />
            </div>
            <span>Parabéns você é um novo apoiador!</span>
          </div>
        )}

        <h1>Seja um apoiador deste projeto 🏆</h1>
        <h3>
          Contribua com apenas <span>R$ 1,00</span>
        </h3>
        <strong>Apareça na nossa home, tenha funcionalidade exclusivas.</strong>

        <PayPalButtons
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: '1',
                  },
                },
              ],
            });
          }}
          onApprove={(data, actions) => {
            return actions.order.capture().then(() => handleSaveDonate());
          }}
        />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  if (!session?.id) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const user = {
    name: session?.user.name,
    id: session?.id,
    image: session?.user.image,
  };

  return {
    props: { user },
  };
};
