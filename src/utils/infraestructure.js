import axios from 'axios';
import config from '../utils/config.js';
import logger from '../utils/logger.js';
import yaml from 'js-yaml';

let infrastructure = null;
let loaded = false;

export async function getInfrastructure() {
    if (loaded) {
        logger.debug('Infrastructure already loaded, returning cached data.');
        return infrastructure;
    }

    try {
        logger.info('Attempting to load infrastructure from gateway.');
        logger.debug(`Infrastructure URL: ${config.gatewayUrl}/api/v1/infrastructure?env=${config.nodeEnv}`);
        const response = await axios.get(`${config.gatewayUrl}/api/v1/infrastructure?env=${config.nodeEnv}`);
        infrastructure = response.data;
        loaded = true;
        logger.info('Infrastructure successfully loaded from gateway.');
    } catch (error) {
        logger.warn('Failed to load infrastructure from gateway, falling back to GitHub');
        logger.debug('Error:' + JSON.stringify(error));
        try {
            logger.info('Attempting to load infrastructure from GitHub.');
            const response = await axios.get(`https://raw.githubusercontent.com/HorizonClouds/api-gateway/develop/infrastructure.${config.nodeEnv}.yaml`);
            //response.data has a yaml format, so we need to convert it to object
            infrastructure = yaml.load(response.data);
            loaded = true;
            logger.info('Infrastructure successfully loaded from GitHub.');
        } catch (githubError) {
            logger.info('Failed to load infrastructure from GitHub:', githubError);
            throw new Error('Unable to load infrastructure configuration');
        }
    }

    logger.debug(JSON.stringify(infrastructure));
    return infrastructure;
}

export function resetInfrastructure() {
    infrastructure = null;
    loaded = false;
}

export async function getServiceUrl(serviceName) {
    logger.debug(`Retrieving URL for service ${serviceName}`);
    infrastructure = await getInfrastructure();
    if (!infrastructure) {
        logger.info('Infrastructure not loaded, returning null.');
        return null;
    }
    try {
        
        logger.debug(`Infrastructure service: ${JSON.stringify(infrastructure.services[serviceName])}`);
        return infrastructure.services[serviceName].url;
    } catch (error) {
        logger.info(`Service ${serviceName} not found in infrastructure:`, error);
        return null;
    }

}