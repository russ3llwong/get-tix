import buildClient from '../api/build-client';
import build from 'next/dist/build';

const LandingPage = ({ currentUser }) => {

    return currentUser ? (
        <h1>You are signed in</h1>
    ) : (
        <h1>You are NOT signed in</h1>
    );
};

// initiated during rendering process
LandingPage.getInitialProps = async (context) => {
    const client = buildClient(context);
    const { data } = await client.get('/api/users/currentuser');
    return data;
};

export default LandingPage;