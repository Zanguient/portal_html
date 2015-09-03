/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão: 1.0 - 03/09/2015
 *
 */

// App
angular.module("tax-services-cadastro-certificado-digital", []) 

.controller("tax-services-cadastro-certificado-digitalCtrl", ['$scope',   
                                            '$state',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis', 
                                            '$timeout',    
                                            function($scope,$state,/*$campos,*/
                                                     $webapi,$apis,$timeout){ 
   
    $scope.paginaInformada = 1; // página digitada pelo privilégio
    $scope.empresas = [];                                            
    $scope.itens_pagina = [50, 100, 150, 200];                                       
    var divPortletBodyCertificadoDigitalPos = 0; // posição da div que vai receber o loading progress                          
    // flags
    $scope.exibeTela = false;                                                                                                  
                                                
    // Inicialização do controller
    $scope.taxServices_cadastroCertificadoDigitalInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Nota Fiscal Eletrônica';                          
        $scope.pagina.subtitulo = 'Cadastro de Certificado Digital';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela) buscaCnpjsBase();
        }); 
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega CNPJs base
            buscaCnpjsBase();
        }); 
        // Acessou a tela
        //$scope.$emit("acessouTela");
        $scope.exibeTela = true;
        buscaCnpjsBase();
    };                                           
                                                
                                            
    
    
    
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           buscaCnpjsBase(); 
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.filtro.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.filtro.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.atualizaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.filtro.pagina; 
    };                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        if($scope.empresas.length > 0) buscaCnpjsBase();   
    };
                                                
                                                
        
                                                
   /* CNPJS BASE */
   var buscaCnpjsBase = function(){
       // ...
   }
       
    
}])