import axios from 'axios';

export default ({ req }) => {
    // server side rendering
    if (typeof window === 'undefined') {
        return axios.create({
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers 
        });
    } else { // client/browser side rendering
        return axios.create({
            baseURL: '/'
        });
    }
}