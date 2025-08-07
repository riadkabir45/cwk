import { useParams } from 'react-router-dom';

function VarIntro() {
    const { namespace } = useParams();

    return (
            <>
            <h1 className="text-3xl font-bold underline">Vite + React{namespace?" + "+namespace:""}</h1>
            <p>This is a dynamic route.</p>
            </>
           );
}

export default VarIntro;
