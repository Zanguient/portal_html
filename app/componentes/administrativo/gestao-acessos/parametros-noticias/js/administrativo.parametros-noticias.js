/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 29/09/2015
 *
 */

// App
angular.module("administrativo-parametros-noticias", []) 

.controller("administrativo-parametros-noticiasCtrl", ['$scope',
                                            '$state',
                                            '$filter',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis', 
                                            function($scope,$state,$filter,/*$campos,*/$webapi,$apis){ 
   
    
    $scope.itens_pagina = [50, 100, 150, 200];
    
    $scope.catalagos = [];                                            
    //$scope.filtro = {catalogo = null};                                            
    
    // flags
    $scope.exibeTela = false;                                            
                                                
    // Inicialização do controller
    $scope.administrativoParametrosNoticiasInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = 'Parâmetros Bancários';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Busca Usuários
            $scope.buscaCatalogos();
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
        // Busca Usuários
        //$scope.buscaUsuarios();
        
        
    };
    
        var buscaCatalogos = function(){
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       
       $webapi.get($apis.getUrl($apis.cliente.empresa, 
                                [$scope.token, 0, /*$campos.cliente.empresa.ds_fantasia*/ 104],
                                filtros)) 
            .then(function(dados){
                $scope.filiais = dados.Registros;
                // Reseta
                if(!nu_cnpj) $scope.filtro.filial = null;
                else $scope.filtro.filial = $filter('filter')($scope.filiais, function(f) {return f.nu_cnpj === nu_cnpj;})[0];
                //$scope.filtro.filial = $scope.filiais.length > 0 ? $scope.filiais[0] : null;
                if($scope.filtro.filial && $scope.filtro.filial !== null)
                    buscaAdquirentes(true, idBandeira); // Busca adquirentes
                else
                    $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter filiais (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });     
    }; 
                                                
                                                
}])