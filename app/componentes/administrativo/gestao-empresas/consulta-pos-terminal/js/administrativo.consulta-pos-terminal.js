/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 03/09/2015
 *
 */

// App
angular.module("administrativo-consulta-pos-terminal", []) 

.controller("administrativo-consulta-pos-terminalCtrl", ['$scope',
                                             '$state',
                                             '$filter',
                                             '$timeout',
                                             /*'$campos',*/
                                             '$webapi',
                                             '$apis',
                                             function($scope,$state,$filter,$timeout,
                                                      /*$campos,*/$webapi,$apis){ 
    
    // Exibição
    $scope.itens_pagina = [50, 100, 150, 200]; 
    $scope.paginaInformada = 1; // página digitada pelo usuário                                             
    // Filtros    
    $scope.filtro = {itens_pagina : $scope.itens_pagina[0], order : 0,
                     pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                    };
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyDadosPos = 1; // posição da div que vai receber o loading progress                                         
    // flag
    $scope.exibeTela = false;                                             
    // Permissões                                           
    var permissaoAlteracao = false;
    var permissaoCadastro = false;
    var permissaoRemocao = false;
                                                 
                                                 
                                                 
    
    // Inicialização do controller
    $scope.administrativo_consultaPOSTerminalInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Administrativo';                          
        $scope.pagina.subtitulo = 'Consulta POS/Terminal';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    // 
                    //...
                }else{ // reseta tudo e não faz buscas 
                    //...
                }
            }
        });
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){
            permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;   
            permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;
            permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;
        }
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega filiais
            // ... if($scope.usuariologado.grupoempresa) // ...
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
    };
                                                 
                                                 
    // PERMISSÕES                                          
    /**
      * Retorna true se o usuário pode cadastrar terminal lógico
      * /
    $scope.usuarioPodeCadastrarDadosAcesso = function(){
        return permissaoCadastro;   
    }*/
    /**
      * Retorna true se o usuário pode alterar terminal lógico
      */
    $scope.usuarioPodeAlterarTerminalLogico = function(){
        return permissaoAlteracao;
    }
    /**
      * Retorna true se o usuário pode excluir terminal lógico
      */
    $scope.usuarioPodeExcluirDadosAcesso = function(){
        return permissaoRemocao;
    }                                             
                                                 
    
    
                                                 
    /* FILTRO */
    
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){

        // ...
    }
    
                  
                                                 
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           //buscaDadosDeAcesso();
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
                                                 
    // EXIBIÇÃO                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
       // if($scope.dadosAcesso.length > 0) $scope.buscaDadosAcesso();
    }; 
                                                 
                                                 
                                        
    
}]);