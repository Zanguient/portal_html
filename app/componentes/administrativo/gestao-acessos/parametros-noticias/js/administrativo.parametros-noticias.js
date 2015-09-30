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
    
    // flags
    $scope.exibeTela = false;                                            
                                                
    // Inicialização do controller
    $scope.administrativoParametrosNoticiasInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = 'Usuários';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){
            if($scope.exibeTela){
                // Modifica a visibilidade do campo de busca para o grupo empresa
                $scope.camposBusca[2].ativo = !$scope.usuariologado.grupoempresa;   
                // Refaz a busca
                $scope.buscaUsuarios();
            }
        }); 
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){// && $scope.methodsDoControllerCorrente.length > 0){
            permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'ATUALIZAÇÃO' }).length > 0;   
            permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'CADASTRO' }).length > 0;
            permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'REMOÇÃO' }).length > 0;
        }
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Busca Usuários
            $scope.buscaUsuarios();
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
        // Busca Usuários
        //$scope.buscaUsuarios();
    };
    
       
}])